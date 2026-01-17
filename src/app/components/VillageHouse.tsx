import { motion } from "motion/react";

interface VillageHouseProps {
  name: string;
  score: number;
  icon: string;
  color: string;
}

export function VillageHouse({ name, score, icon, color }: VillageHouseProps) {
  const growth = score / 100;
  const height = 60 + growth * 40;
  
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative"
        animate={{
          y: [0, -2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          width="80"
          height={height}
          viewBox={`0 0 80 ${height}`}
          className="drop-shadow-md"
        >
          {/* House base */}
          <motion.rect
            x="15"
            y={height - 50}
            width="50"
            height="50"
            fill={color}
            rx="4"
            initial={{ height: 30 }}
            animate={{ height: 50 * growth }}
            transition={{ duration: 0.8 }}
          />
          
          {/* Roof */}
          <motion.path
            d={`M10 ${height - 50} L40 ${height - 70} L70 ${height - 50} Z`}
            fill="#78350f"
            initial={{ opacity: 0 }}
            animate={{ opacity: growth }}
            transition={{ duration: 0.8 }}
          />
          
          {/* Door */}
          {growth > 0.3 && (
            <motion.rect
              x="32"
              y={height - 35}
              width="16"
              height="20"
              fill="#451a03"
              rx="2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            />
          )}
          
          {/* Windows */}
          {growth > 0.5 && (
            <>
              <motion.rect
                x="20"
                y={height - 40}
                width="8"
                height="8"
                fill="#fef3c7"
                rx="1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              />
              <motion.rect
                x="52"
                y={height - 40}
                width="8"
                height="8"
                fill="#fef3c7"
                rx="1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              />
            </>
          )}
          
          {/* Smoke from chimney */}
          {growth > 0.7 && (
            <>
              <motion.circle
                cx="62"
                cy={height - 75}
                r="3"
                fill="#9ca3af"
                animate={{
                  y: [-10, -20],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <motion.circle
                cx="65"
                cy={height - 70}
                r="2"
                fill="#9ca3af"
                animate={{
                  y: [-10, -20],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5,
                  ease: "easeOut",
                }}
              />
            </>
          )}
        </svg>
      </motion.div>
      
      <div className="text-center">
        <div className="text-2xl mb-1">{icon}</div>
        <div className="text-sm font-medium text-gray-700">{name}</div>
        <div className="text-xs text-gray-500">{Math.round(score)}%</div>
      </div>
    </motion.div>
  );
}
