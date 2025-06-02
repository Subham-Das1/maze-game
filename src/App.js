import React, { useState, useEffect, useCallback } from "react";
import "./background.css"; 

// const FIXED_SIZE = 400; 
const FIXED_SIZE = Math.min(window.innerWidth * 0.8, 400); 
const INITIAL_SIZES = {
  Easy: { width: 10, height: 10 },
  Medium: { width: 12, height: 12 },
  Hard: { width: 20, height: 20 },
};

const directions = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

const generateMazeStructure = (size) => {
  const maze = Array.from({ length: size.height }, (_, y) =>
    Array.from({ length: size.width }, (_, x) => ({
      x,
      y,
      walls: [true, true, true, true],
      visited: false,
    }))
  );

  const stack = [];
  const start = { x: 0, y: 0 };
  maze[start.y][start.x].visited = true;
  stack.push(start);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = directions
      .map((dir) => ({
        x: current.x + dir.x,
        y: current.y + dir.y,
      }))
      .filter(
        ({ x, y }) =>
          x >= 0 &&
          x < size.width &&
          y >= 0 &&
          y < size.height &&
          !maze[y][x].visited
      );

    if (neighbors.length === 0) {
      stack.pop();
    } else {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      const dx = next.x - current.x;
      const dy = next.y - current.y;

      if (dx === 1) {
        maze[current.y][current.x].walls[1] = false;
        maze[next.y][next.x].walls[3] = false;
      } else if (dx === -1) {
        maze[current.y][current.x].walls[3] = false;
        maze[next.y][next.x].walls[1] = false;
      }

      if (dy === 1) {
        maze[current.y][current.x].walls[2] = false;
        maze[next.y][next.x].walls[0] = false;
      } else if (dy === -1) {
        maze[current.y][current.x].walls[0] = false;
        maze[next.y][next.x].walls[2] = false;
      }

      maze[next.y][next.x].visited = true;
      stack.push(next);
    }
  }

  return maze;
};

function App() {
  const [difficulty, setDifficulty] = useState("Easy");
  const [mazeSize, setMazeSize] = useState(INITIAL_SIZES.Easy);
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [visitedCells, setVisitedCells] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);

  const cellSize = FIXED_SIZE / Math.max(mazeSize.width, mazeSize.height);

  const generateMaze = useCallback(() => {
    const newMaze = generateMazeStructure(mazeSize);
    setMaze(newMaze);
    setPlayerPos({ x: 0, y: 0 });
    setVisitedCells([{ x: 0, y: 0 }]);
    setCompleted(false);
    setStartTime(Date.now());
    setTimeTaken(0);
  }, [mazeSize]);

  const handleMove = useCallback(
    (dx, dy) => {
      if (completed) return;

      const newX = playerPos.x + dx;
      const newY = playerPos.y + dy;

      if (
        newX >= 0 &&
        newX < mazeSize.width &&
        newY >= 0 &&
        newY < mazeSize.height
      ) {
        const currentCell = maze[playerPos.y][playerPos.x];
        const dirIndex = directions.findIndex((d) => d.x === dx && d.y === dy);

        if (!currentCell.walls[dirIndex]) {
          setPlayerPos({ x: newX, y: newY });

          setVisitedCells((prev) => {
            const alreadyVisited = prev.some(
              (cell) => cell.x === newX && cell.y === newY
            );
            return alreadyVisited ? prev : [...prev, { x: newX, y: newY }];
          });
        }
      }
    },
    [playerPos, maze, mazeSize, completed]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowRight":
          handleMove(1, 0);
          break;
        case "ArrowLeft":
          handleMove(-1, 0);
          break;
        case "ArrowDown":
          handleMove(0, 1);
          break;
        case "ArrowUp":
          handleMove(0, -1);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove]);

  useEffect(() => {
    generateMaze();
  }, [generateMaze]);

  useEffect(() => {
    if (
      playerPos.x === mazeSize.width - 1 &&
      playerPos.y === mazeSize.height - 1
    ) {
      setCompleted(true);
      setTimeTaken((Date.now() - startTime) / 1000);
    }
  }, [playerPos, mazeSize, startTime]);

  useEffect(() => {
    if (!startTime || completed) return;
    const timer = setInterval(() => {
      setTimeTaken((Date.now() - startTime) / 1000);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, completed]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setMazeSize(INITIAL_SIZES[newDifficulty]);
  };

  return (
    <div className="animated-background">
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6 z-10">
          <div className="flex items-center justify-between mb-4 header">
            <div className="heading"><h1 className="text-3xl font-bold text-gray-800 w-max">Maze Game</h1></div>
            <div className="navigation">
              {["Easy", "Medium", "Hard"].map((level) => (
                <button
                  key={level}
                  className={`bg-${
                    difficulty === level ? "blue-700" : "gray-300"
                  } text-white py-1 px-3 nav-btn rounded`}
                  onClick={() => handleDifficultyChange(level)}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="content-right">
            <p className="text-lg text-gray-700 ">
              {completed
                ? `🎉 Completed in ${formatTime(timeTaken)}!`
                : `Time: ${formatTime(timeTaken)}`}
            </p></div>
          </div>
          <div className="herosection">
            <div
              className="maze-container flex items-center justify-center"
              style={{
                width: FIXED_SIZE,
                height: FIXED_SIZE,
                display: "grid",
                gridTemplateColumns: `repeat(${mazeSize.width}, ${cellSize}px)`,
                gap: "2px",
              }}
            >
              {maze.flatMap((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor:
                        playerPos.x === colIndex && playerPos.y === rowIndex
                          ? "#f39c12"
                          : colIndex === mazeSize.width - 1 &&
                            rowIndex === mazeSize.height - 1
                          ? "#2ecc71"
                          : visitedCells.some(
                              (visited) =>
                                visited.x === colIndex && visited.y === rowIndex
                            )
                          ? "#1890E0"
                          : "#1d1d1d",
                      borderTop: cell.walls[0] ? "3px solid #fff" : "none",
                      borderRight: cell.walls[1] ? "3px solid #fff" : "none",
                      borderBottom: cell.walls[2] ? "3px solid #fff" : "none",
                      borderLeft: cell.walls[3] ? "3px solid #fff" : "none",
                      boxSizing: "border-box",
                    }}
                  ></div>
                ))
              )}
            </div>
            <button
              className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 last-btn"
              onClick={generateMaze}>
              Generate New Maze
          </button>
          <h3 className="arrow">Use arrow to navigate to reach the green goal</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
