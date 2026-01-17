import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import * as kv from "./kv_store.tsx";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = new Hono();

/* -------------------- MIDDLEWARE -------------------- */
app.use("*", logger());
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

/* -------------------- HEALTH -------------------- */
app.get("/make-server-f9caf0ac/health", (c) => {
  return c.json({ status: "ok" });
});

/* -------------------- GEMINI CLIENT -------------------- */
const getGeminiClient = () => {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set");
  }
  return new GoogleGenerativeAI(apiKey);
};

/* -------------------- SAVE WELLNESS -------------------- */
app.post("/make-server-f9caf0ac/wellness", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, score, tasks } = body;

    if (typeof userId !== "string" || typeof score !== "number") {
      return c.json({ error: "Invalid payload" }, 400);
    }

    await kv.set(`wellness:${userId}`, {
      score,
      tasks: Array.isArray(tasks) ? tasks : [],
      timestamp: Date.now(),
    });

    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e?.message ?? "Internal error" }, 500);
  }
});

/* -------------------- GET WELLNESS -------------------- */
app.get("/make-server-f9caf0ac/wellness/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const data = await kv.get(`wellness:${userId}`);
    return c.json(data ?? { score: 50, tasks: [] });
  } catch (e: any) {
    return c.json({ error: e?.message ?? "Internal error" }, 500);
  }
});

/* -------------------- CHAT -------------------- */
app.post("/make-server-f9caf0ac/chat", async (c) => {
  try {
    const body = await c.req.json();
    const { message, userId } = body;

    if (typeof message !== "string" || typeof userId !== "string") {
      return c.json({ error: "Invalid payload" }, 400);
    }

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    const systemPrompt = `
You are a compassionate mental wellness coach for Indian family dynamics.
Be empathetic, culturally sensitive, and non-judgmental.
Encourage communication over separation.
`;

    const result = await model.generateContent(
      `${systemPrompt}\nUser: ${message}`,
    );

    const response = result.response.text();

    await kv.set(`chat:${userId}:${Date.now()}`, {
      message,
      response,
      timestamp: Date.now(),
    });

    return c.json({ response });
  } catch (e: any) {
    return c.json({ error: e?.message ?? "Internal error" }, 500);
  }
});

/* -------------------- ANALYTICS (FIXED & TYPE-SAFE) -------------------- */
app.get("/make-server-f9caf0ac/analytics", async (c) => {
  try {
    const rows = await kv.getByPrefix("wellness:");

    if (rows.length === 0) {
      return c.json({
        totalUsers: 0,
        averageScore: 50,
        weeklyAverage: 50,
        recentTrends: [],
      });
    }

    const trends = rows
      .map((r) => {
        if (!r || !r.key || !r.value) return null;

        const userId = r.key.split(":")[1];
        const score = r.value.score;
        const timestamp = r.value.timestamp;

        if (
          typeof userId !== "string" ||
          typeof score !== "number" ||
          typeof timestamp !== "number"
        ) {
          return null;
        }

        return { userId, score, timestamp };
      })
      .filter(
        (t): t is { userId: string; score: number; timestamp: number } =>
          t !== null,
      );

    const totalUsers = new Set(trends.map((t) => t.userId)).size;

    const avgScore =
      trends.reduce((sum, t) => sum + t.score, 0) / trends.length;

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekly = trends.filter((t) => t.timestamp >= weekAgo);

    const weeklyAverage =
      weekly.length > 0
        ? weekly.reduce((s, t) => s + t.score, 0) / weekly.length
        : avgScore;

    return c.json({
      totalUsers,
      averageScore: Math.round(avgScore),
      weeklyAverage: Math.round(weeklyAverage),
      recentTrends: weekly
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20),
    });
  } catch (e: any) {
    return c.json({ error: e?.message ?? "Internal error" }, 500);
  }
});

/* -------------------- START SERVER -------------------- */
Deno.serve(app.fetch);
