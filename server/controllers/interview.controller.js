import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import { deductCredits } from "./user.controller.js";

import Interview from "../models/interview.model.js";
import askAi from "../services/openRouter.services.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const standardFontDataUrl = path.join(
//   __dirname,
//   "../node_modules/pdfjs-dist/standard_fonts/"
// );
pdfjsLib.GlobalWorkerOptions.verbosity = 0;
      const extractPdfText = async (filePath) => {
          try {
            const data = await fs.readFile(filePath);

            const loadingTask = pdfjsLib.getDocument({
              data: new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
              useSystemFonts: true, // Use system fonts as fallback
              disableFontFace: true  // Skip font face compilation in node environment
            });

        const pdf = await loadingTask.promise;
            let text = "";

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
              const page = await pdf.getPage(pageNumber);
              const content = await page.getTextContent();

              const pageText = content.items
                .map((item) => item.str)
                .join(" ");

              text += pageText + "\n";
            }

            return text;

          } catch (error) {
            console.error("PDF extraction detail:", error); // Logs exact underlying error in terminal
            throw new Error("Failed to read resume PDF");
          }
        };

export const analyzeResume = async (req, res) => {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume PDF is required" });
    }

    uploadedFilePath = req.file.path;
    const resumeText = await extractPdfText(uploadedFilePath);

    if (!resumeText.trim()) {
      return res.status(400).json({ message: "Could not extract text from resume" });
    }

    const prompt = [
      "Extract structured candidate information from this resume.",
      "",
      "Return ONLY valid JSON:",
      '{ "role": "", "experience": "", "projects": [], "skills": [] }',
      "",
      "Resume:",
      resumeText
    ].join("\n");

    const aiResponse = await askAi(prompt);

    let data;
    try {
      data = JSON.parse(
        aiResponse.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim()
      );
    } catch {
      data = { role: "", experience: "", projects: [], skills: [] };
    }

    return res.status(200).json({
      role: data.role || "",
      experience: data.experience || "",
      projects: Array.isArray(data.projects) ? data.projects : [],
      skills: Array.isArray(data.skills) ? data.skills : [],
      resumeText
    });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return res.status(500).json({
      message: error.message || "Resume analysis failed"
    });
  } finally {
    if (uploadedFilePath) {
      try { await fs.unlink(uploadedFilePath); } catch {}
    }
  }
};

export const startInterview = async (req, res) => {
  let uploadedFilePath = null;

  try {
    const {
      jobRole,
      experience,
      interviewType
    } = req.body;

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User is not authenticated"
      });
    }

    if (
      !jobRole ||
      experience === undefined ||
      !interviewType
    ) {
      return res.status(400).json({
        message:
          "Job role, experience and interview type are required"
      });
    }

    uploadedFilePath = req.file?.path || null;

    const resumeText = req.file
      ? await extractPdfText(req.file.path)
      : "";

    const prompt = `
You are an expert technical interviewer.

Analyze the following resume.

Job Role:
${jobRole}

Experience:
${experience} years

Interview Type:
${interviewType}

Resume:
${resumeText}

Return a JSON object with exactly these fields:

{
  "experienceSummary": "",
  "projects": [],
  "skills": [],
  "questions": []
}

The questions array should contain 5 interview questions
that are relevant to the candidate's resume and job role.

Return ONLY valid JSON.
`;

    const aiResponse = await askAi(prompt);

    let aiData;

    try {
      const cleanedResponse = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      aiData = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error(
        "AI JSON parsing error:",
        error.message
      );

      aiData = {
        experienceSummary: aiResponse,
        projects: [],
        skills: [],
        questions: []
      };
    }

    const questions = (aiData.questions || [])
      .map((question) => ({
        question:
          typeof question === "string"
            ? question
            : question.question || "",
        answer: "",
        feedback: ""
      }))
      .filter(
        (question) =>
          question.question.trim() !== ""
      )
      .slice(0, 5);

    if (questions.length === 0) {
      return res.status(500).json({
        message:
          "AI could not generate interview questions"
      });
    }

    const interview = await Interview.create({
      userId,
      jobRole,
      experience: Number(experience),
      interviewType,

      resume: path.basename(
        req.file.path
      ),

      resumeText,
      questions,
      score: 0,
      report: ""
    });
    let creditsLeft;
    try {
      creditsLeft = await deductCredits(userId, 10);
    } catch (error) {
      await Interview.findByIdAndDelete(interview._id);
      return res.status(400).json({ message: error.message });
    }

    return res.status(201).json({
      message:
        "Interview created successfully",

      interviewId: interview._id,
      creditsLeft,

      interview: {
        id: interview._id,
        jobRole: interview.jobRole,
        experience: interview.experience,
        interviewType:
          interview.interviewType,
        questions: interview.questions
      },

      analysis: {
        experienceSummary:
          aiData.experienceSummary,
        projects: aiData.projects,
        skills: aiData.skills
      }
    });

  } catch (error) {
    console.error(
      "Start interview error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to start interview"
    });

  } finally {
    if (uploadedFilePath) {
      try {
        await fs.unlink(
          uploadedFilePath
        );
      } catch (error) {
        console.log(
          "Could not delete uploaded file"
        );
      }
    }
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionId, answer } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User is not authenticated" });
    }

    if (!interviewId || !questionId) {
      return res.status(400).json({
        message: "Interview ID and question ID are required"
      });
    }

    const interview = await Interview.findOne({ _id: interviewId, userId });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Safely look up question by subdocument ID or array index fallback
    let question = interview.questions.id(questionId);
    if (!question) {
      question = interview.questions.find((q) => q._id?.toString() === questionId || q.id === questionId);
    }

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const submittedAnswer = answer || "No answer provided.";
    question.answer = submittedAnswer;

    const prompt = `
You are an expert technical interviewer.

Evaluate the candidate's answer to the interview question.

Question:
${question.question}

Candidate Answer:
${submittedAnswer}

Return ONLY valid JSON in exactly this format:

{
  "feedback": "",
  "score": 0
}

Rules:
- score must be a number from 0 to 10
- feedback should briefly explain what was good, what was missing, and how the answer could be improved
- do not include markdown
`;

    const aiResponse = await askAi(prompt);
    let evaluation;

    try {
      const cleanedResponse = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      evaluation = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Answer evaluation JSON parsing error:", error.message);
      evaluation = { feedback: aiResponse, score: 0 };
    }

    question.feedback = evaluation.feedback || "";
    question.score = Math.max(0, Math.min(10, Number(evaluation.score) || 0));
    await interview.save();

    return res.status(200).json({
      message: "Answer evaluated successfully",
      questionId,
      feedback: question.feedback,
      score: Number(evaluation.score) || 0
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    return res.status(500).json({
      message: error.message || "Failed to submit answer"
    });
  }
};


export const generateInterviewReport = async (
  req,
  res
) => {
  try {
    const { interviewId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message:
          "User is not authenticated"
      });
    }

    if (!interviewId) {
      return res.status(400).json({
        message:
          "Interview ID is required"
      });
    }

    const interview =
      await Interview.findOne({
        _id: interviewId,
        userId
      });

    if (!interview) {
      return res.status(404).json({
        message:
          "Interview not found"
      });
    }

    if (
      !interview.questions ||
      interview.questions.length === 0
    ) {
      return res.status(400).json({
        message:
          "No interview questions found"
      });
    }

    const unansweredQuestions =
      interview.questions.filter(
        (question) =>
          !question.answer ||
          question.answer.trim() === ""
      );

    if (unansweredQuestions.length > 0) {
      return res.status(400).json({
        message:
          "Please answer all interview questions before generating the report"
      });
    }

    const questionsText =
      interview.questions
        .map(
          (question, index) => `
Question ${index + 1}:
${question.question}

Candidate Answer:
${question.answer}

AI Feedback:
${question.feedback}
`
        )
        .join("\n");

    const prompt = `
You are an expert interview evaluator.

Analyze the following completed interview.

Job Role:
${interview.jobRole}

Experience:
${interview.experience} years

Interview Type:
${interview.interviewType}

Questions and Answers:
${questionsText}

Return ONLY valid JSON in exactly this format:

{
  "score": 0,
  "report": "",
  "strengths": [],
  "weaknesses": [],
  "recommendation": ""
}

Rules:
- score must be from 0 to 100
- report should summarize the overall performance
- strengths should contain important strengths
- weaknesses should contain important weaknesses
- recommendation should give a final hiring/interview recommendation
- return only valid JSON
`;

    const aiResponse = await askAi(prompt);

    let result;

    try {
      const cleanedResponse = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      result = JSON.parse(cleanedResponse);

    } catch (error) {
      console.error(
        "Report JSON parsing error:",
        error.message
      );

      result = {
        score: 0,
        report: aiResponse,
        strengths: [],
        weaknesses: [],
        recommendation: ""
      };
    }

    const finalScore =
      Math.max(
        0,
        Math.min(
          100,
          Number(result.score) || 0
        )
      );

    interview.score = finalScore;
    interview.status = "completed";

    interview.report =
      result.report || "";

    await interview.save();

    return res.status(200).json({
      message:
        "Interview report generated successfully",

      interviewId:
        interview._id,

      score: finalScore,

      report:
        result.report || "",

      strengths:
        result.strengths || [],

      weaknesses:
        result.weaknesses || [],

      recommendation:
        result.recommendation || "",

      questions: interview.questions
    });

  } catch (error) {
    console.error(
      "Generate interview report error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to generate interview report"
    });
  }
};
export const getInterviewReport = async (req, res) => {
  try {
    const userId = req.userId;
    const { interviewId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "User is not authenticated"
      });
    }

    if (!interviewId) {
      return res.status(400).json({
        message: "Interview ID is required"
      });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      userId
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found"
      });
    }

    return res.status(200).json({
      message: "Interview report fetched successfully",
      interview
    });

  } catch (error) {
    console.error(
      "Get interview report error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to fetch interview report"
    });
  }
};

