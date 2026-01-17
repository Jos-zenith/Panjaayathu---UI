import { useState, useEffect } from "react";
import { DiyaStreak } from "@/app/components/DiyaStreak";
import { VillageHouse } from "@/app/components/VillageHouse";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface Task {
  id: string;
  label: string;
  category: string;
  completed: boolean;
}

export function VillagePage() {
  const [userId] = useState(() => `user-${Date.now()}`);
  const [wellnessScore, setWellnessScore] = useState(50);
  const [streak, setStreak] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", label: "Morning meditation (5 min)", category: "mind", completed: false },
    { id: "2", label: "Gratitude journal entry", category: "mind", completed: false },
    { id: "3", label: "Physical activity", category: "body", completed: false },
    { id: "4", label: "Connect with family", category: "relationships", completed: false },
    { id: "5", label: "Creative expression", category: "soul", completed: false },
  ]);

  useEffect(() => {
    loadWellnessData();
  }, []);

  useEffect(() => {
    saveWellnessData();
  }, [wellnessScore, tasks]);

  const loadWellnessData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9caf0ac/wellness/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.score) {
        setWellnessScore(data.score);
      }
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Error loading wellness data:", error);
    }
  };

  const saveWellnessData = async () => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9caf0ac/wellness`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            score: wellnessScore,
            tasks,
          }),
        }
      );
    } catch (error) {
      console.error("Error saving wellness data:", error);
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) => {
      const newTasks = prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      
      // Calculate new wellness score
      const completedCount = newTasks.filter((t) => t.completed).length;
      const newScore = Math.min(100, 30 + (completedCount / newTasks.length) * 70);
      setWellnessScore(Math.round(newScore));
      
      // Update streak
      if (newTasks.every((t) => t.completed)) {
        setStreak((prev) => prev + 1);
      }
      
      return newTasks;
    });
  };

  const categoryScores = {
    mind: tasks.filter(t => t.category === "mind" && t.completed).length / tasks.filter(t => t.category === "mind").length * 100 || 0,
    body: tasks.filter(t => t.category === "body" && t.completed).length / tasks.filter(t => t.category === "body").length * 100 || 0,
    relationships: tasks.filter(t => t.category === "relationships" && t.completed).length / tasks.filter(t => t.category === "relationships").length * 100 || 0,
    soul: tasks.filter(t => t.category === "soul" && t.completed).length / tasks.filter(t => t.category === "soul").length * 100 || 0,
  };

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-stone-800 mb-2">
            Your Mind Village
          </h1>
          <p className="text-lg text-forest-700">
            Panjaayathu - பஞ்சாயத்து
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Diya Streak */}
          <div className="md:col-span-1">
            <DiyaStreak streak={streak} />
          </div>

          {/* Daily Practices */}
          <div className="md:col-span-2">
            <Card className="border-stone-300">
              <CardHeader>
                <CardTitle className="text-forest-800">Pancha-Practices</CardTitle>
                <CardDescription className="text-stone-600">
                  Complete your daily wellness rituals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <Checkbox
                        id={task.id}
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                      />
                      <label
                        htmlFor={task.id}
                        className={`flex-1 cursor-pointer text-sm font-medium ${
                          task.completed
                            ? "line-through text-stone-500"
                            : "text-stone-900"
                        }`}
                      >
                        {task.label}
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-forest-50 to-forest-100 rounded-lg border border-forest-200">
                  <div className="text-sm text-stone-700 mb-2">Overall Wellness</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-stone-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-forest-600 to-forest-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${wellnessScore}%` }}
                      />
                    </div>
                    <div className="text-lg font-bold text-forest-700">
                      {wellnessScore}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Village Square */}
        <Card className="border-stone-300">
          <CardHeader>
            <CardTitle className="text-forest-800">Village Square</CardTitle>
            <CardDescription className="text-stone-600">
              Watch your inner village grow with each practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
              <VillageHouse
                name="Mind Temple"
                score={categoryScores.mind}
                icon="🧘"
                color="#4ade80"
              />
              <VillageHouse
                name="Body Well"
                score={categoryScores.body}
                icon="💪"
                color="#16a34a"
              />
              <VillageHouse
                name="Heart Home"
                score={categoryScores.relationships}
                icon="❤️"
                color="#dc2626"
              />
              <VillageHouse
                name="Soul Garden"
                score={categoryScores.soul}
                icon="🌺"
                color="#15803d"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}