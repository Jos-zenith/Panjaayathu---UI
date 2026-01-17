import { motion } from "motion/react";

interface DiyaStreakProps {
  streak: number;
  maxStreak?: number;
}

export function DiyaStreak({ streak, maxStreak = 7 }: DiyaStreakProps) {
  const intensity = Math.min(streak / maxStreak, 1);
  
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl border-2 border-stone-300">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-stone-800 mb-1">Diya Streak</h3>
        <p className="text-sm text-stone-600">Keep your inner light burning</p>
      </div>
      
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Diya flame */}
        <svg
          width="80"
          height="100"
          viewBox="0 0 80 100"
          className="drop-shadow-lg"
        >
          {/* Glow effect */}
          <defs>
            <radialGradient id="flameGlow" cx="50%" cy="50%">
              <stop
                offset="0%"
                stopColor="#fbbf24"
                stopOpacity={intensity}
              />
              <stop
                offset="100%"
                stopColor="#f59e0b"
                stopOpacity="0"
              />
            </radialGradient>
          </defs>
          
          {/* Glow circle */}
          <motion.circle
            cx="40"
            cy="35"
            r="30"
            fill="url(#flameGlow)"
            animate={{
              opacity: [0.3 * intensity, 0.6 * intensity, 0.3 * intensity],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Flame */}
          <motion.path
            d="M40 20 Q45 30 43 45 Q41 55 40 60 Q39 55 37 45 Q35 30 40 20 Z"
            fill="#f59e0b"
            animate={{
              d: [
                "M40 20 Q45 30 43 45 Q41 55 40 60 Q39 55 37 45 Q35 30 40 20 Z",
                "M40 18 Q46 28 44 43 Q42 53 40 58 Q38 53 36 43 Q34 28 40 18 Z",
                "M40 20 Q45 30 43 45 Q41 55 40 60 Q39 55 37 45 Q35 30 40 20 Z",
              ],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            opacity={Math.max(0.3, intensity)}
          />
          
          {/* Inner flame */}
          <motion.path
            d="M40 25 Q42 32 41 40 Q40 45 40 48 Q40 45 39 40 Q38 32 40 25 Z"
            fill="#fbbf24"
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            opacity={Math.max(0.4, intensity)}
          />
          
          {/* Diya base */}
          <ellipse
            cx="40"
            cy="65"
            rx="25"
            ry="8"
            fill="#92400e"
          />
          <ellipse
            cx="40"
            cy="65"
            rx="20"
            ry="6"
            fill="#b45309"
          />
          <rect
            x="30"
            y="60"
            width="20"
            height="5"
            fill="#92400e"
            rx="2"
          />
        </svg>
      </motion.div>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-orange-600">
          {streak} {streak === 1 ? 'day' : 'days'}
        </div>
        <div className="flex gap-1 mt-2 justify-center">
          {Array.from({ length: maxStreak }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < streak
                  ? 'bg-orange-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}