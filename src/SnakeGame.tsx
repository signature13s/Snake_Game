import { useState, useEffect, useRef } from 'react';
import logo from './assets/snake-game-ai-gen.png';
import foodSound from './assets/music/food.mp3'
import gameOver from './assets/music/gameover.mp3'
import moveSound from './assets/music/move.mp3'
import musicSound from './assets/music/music.mp3'

    interface Position {
  x: number;
  y: number;
}

const gridSize = 20;
const initialSnake = [{ x: 10, y: 10 }];
const initialGameSpeedDelay = 200;

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(initialSnake);
  const [food, setFood] = useState<Position>(generateFood());
  const [direction, setDirection] = useState<string>('right');
  const [gameSpeedDelay, setGameSpeedDelay] = useState<number>(initialGameSpeedDelay);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCollidedRef = useRef<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const isGameStartedRef = useRef<boolean>(false);
  const directionRef = useRef<string>('right');
  const foodEatenRef = useRef<boolean>(false);

  
    function playAudio(audio:any){
  new Audio(audio).play();
    }
    const backGroundMusic = new Audio(musicSound);
//     function playMusic(){
//   backGroundMusic.play();
//   backGroundMusic.loop=true;
//     }
     
    
  
  function generateFood(): Position {
    const x = Math.floor(Math.random() * gridSize) + 1;
    const y = Math.floor(Math.random() * gridSize) + 1;
    const newFood = { x, y };
    //console.log('Generated new food at:', newFood);
    return snake.some(segment => segment.x === x && segment.y === y) ? generateFood() : newFood;
  }

  function drawSnake() {
    return snake.map((segment, index) => (
      <div
        key={`snake-${index}`}
        className="snake"
        style={{
          gridColumn: Math.floor(segment.x),
          gridRow: Math.floor(segment.y),
          border: '1px dotted #5a5a5a',
          backgroundColor: '#414141',
        }}
      />
    ));
  }

  function drawFood() {
    if (!gameStarted) return null;
    return (
      <div
        className="food"
        style={{
          gridColumn: Math.floor(food.x),
          gridRow: Math.floor(food.y),
          backgroundColor: '#dedede',
          border: '5px solid #999',
        }}
      />
    );
  }

  function move() {
  if (hasCollidedRef.current) return;

  //console.log('Before move - Snake length:', snake.length, 'Score:', score);

  setSnake((prevSnake) => {
    const head = { ...prevSnake[0] };
    head.x = Math.floor(head.x);
    head.y = Math.floor(head.y);
    switch (directionRef.current) {
      case 'up':
        head.y--;
        break;
      case 'down':
        head.y++;
        break;
      case 'left':
        head.x--;
        break;
      case 'right':
        head.x++;
        break;
    }
    head.x = Math.floor(head.x);
    head.y = Math.floor(head.y);

    const newSnake = [head, ...prevSnake];
    const foodX = Math.floor(food.x);
    const foodY = Math.floor(food.y);

    /*//console.log(
      'Snake head at:',
      { x: head.x, y: head.y },
      'Food at:',
      { x: foodX, y: foodY },
      'Score:',
      score,
      'Snake length before update:',
      newSnake.length
    );*/

    if (head.x === foodX && head.y === foodY) {
      //console.log('Food eaten at:', { x: foodX, y: foodY });
      playAudio(foodSound);
      setFood(generateFood());
      setScore((prev) => {
        const newScore = prev + 1;
        //console.log('Score incremented to:', newScore);
        return newScore;
      });
      increaseSpeed();
      //console.log('Snake should grow, new length:', newSnake.length);
      // Do not pop the tail, allowing the snake to grow
    } else {
      newSnake.pop(); // Remove tail only if food is not eaten
      //console.log('Snake moved, new length:', newSnake.length);
    }

    const hasCollided = checkCollision(newSnake);
    if (hasCollided) {
      return prevSnake; // Return previous snake to avoid updating after collision
    }

    //console.log('Snake updated, final length:', newSnake.length);
    return newSnake;
  });
}

  function increaseSpeed() {
    setGameSpeedDelay(prev => {
      const newDelay = prev > 150 ? prev - 5 : prev > 100 ? prev - 3 : prev > 50 ? prev - 2 : prev > 25 ? prev - 1 : prev;
      //console.log('Game speed delay updated to:', newDelay);
      return newDelay;
    });
  }

  function checkCollision(snakeToCheck: Position[]): boolean {
    if (hasCollidedRef.current) return false;

    const head = snakeToCheck[0];
    let collided = false;
    if (head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize) {
      collided = true;
      backGroundMusic.loop=false;
      backGroundMusic.pause;
      playAudio(gameOver)
      setTimeout(() => {
      alert('Collided with wall! Game Over!');
      }, 500);
    } else {
      for (let i = 1; i < snakeToCheck.length; i++) {
        if (head.x === snakeToCheck[i].x && head.y === snakeToCheck[i].y) {
          collided = true;
          backGroundMusic.loop=false;
      backGroundMusic.pause;
          playAudio(gameOver)
      

         setTimeout(() => {
    alert('Collided with self! Game Over!');
         }, 500);
          break;
        }
      }
    }

    if (collided) {
      hasCollidedRef.current = true;
      stopGame();
      resetGame();
      return true;
    }
    return false;
  }

 function resetGame() {
  updateHighScore();
  setSnake(initialSnake);
  setFood(generateFood());
  setDirection('right');
  directionRef.current = 'right';
  setGameSpeedDelay(initialGameSpeedDelay);
  setScore(0);
  setGameStarted(false);
  isGameStartedRef.current = false;
  hasCollidedRef.current = false;
  //console.log('Game reset - ready to restart, gameStarted:', gameStarted);
  if (gameContainerRef.current) {
    gameContainerRef.current.focus();
    //console.log('Game container refocused after reset');
  }
}

  function updateHighScore() {
    if (score > highScore) {
      setHighScore(score);
      //console.log('New high score set to:', score);
    }
  }

  function stopGame() {
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
      //console.log('Game loop stopped');
    }
    setGameStarted(false);
    isGameStartedRef.current = false;
  }

  useEffect(() => {
    if (!gameStarted || hasCollidedRef.current) return;

    //console.log('Starting game loop with speed delay:', gameSpeedDelay);
    gameIntervalRef.current = setInterval(() => {
      //console.log('Moving snake, direction:', directionRef.current);
      move();
    }, gameSpeedDelay);

    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
        gameIntervalRef.current = null;
        //console.log('Game loop cleared due to speed change or game stop');
      }
    };
  }, [gameStarted, gameSpeedDelay]);

  function startGame() {
    if (hasCollidedRef.current) return;
    setGameStarted(true);
    // playMusic()
    isGameStartedRef.current = true;
    hasCollidedRef.current = false;
    foodEatenRef.current = false;
    directionRef.current = direction;
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
      //console.log('Game container focused on start');
    }
  }

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      event.preventDefault();
      //console.log('Key pressed:', event.key, 'gameStarted:', gameStarted, 'isGameStartedRef:', isGameStartedRef.current, 'hasCollided:', hasCollidedRef.current);
      if (event.code === 'Space' || event.key === ' ') {
        if (!isGameStartedRef.current) {
          //console.log('Starting game');
          startGame();
        }
      }
      if (isGameStartedRef.current && !hasCollidedRef.current) {
        //console.log('Processing direction change, current direction:', direction);
        let newDirection = direction;
        switch (event.key) {
          case 'ArrowUp':
            if (direction !== 'down') {
              newDirection = 'up';
              //console.log('Direction set to up');
              playAudio(moveSound);
            }
            break;
          case 'ArrowDown':
            if (direction !== 'up') {
              newDirection = 'down';
              //console.log('Direction set to down');
              playAudio(moveSound);

            }
            break;
          case 'ArrowLeft':
            if (direction !== 'right') {
              newDirection = 'left';
              //console.log('Direction set to left');
              playAudio(moveSound);

            }
            break;
          case 'ArrowRight':
            if (direction !== 'left') {
              newDirection = 'right';
              //console.log('Direction set to right');
              playAudio(moveSound);

            }
            break;
        }
        if (newDirection !== direction) {
          setDirection(newDirection);
          directionRef.current = newDirection;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    //console.log('Keypress listener added');
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      //console.log('Keypress listener removed');
    };
  }, [direction]);

  useEffect(() => {
    //console.log('gameStarted state updated to:', gameStarted);
    isGameStartedRef.current = gameStarted;
  }, [gameStarted]);

  useEffect(() => {
    //console.log('Snake state updated, current length:', snake.length);
  }, [snake]);

  useEffect(() => {
    //console.log('Score state updated to:', score);
  }, [score]);

  useEffect(() => {
    //console.log('High score state updated to:', highScore);
  }, [highScore]);

  return (
    <div
      ref={gameContainerRef}
      tabIndex={0}
      className="flex flex-col items-center justify-center h-screen bg-[#414141] font-vt323 outline-none"
    >
      <div className="flex justify-between w-[480px] mb-2">
        <h1 className="text-[40px] font-bold text-[#abb78a]">{score.toString().padStart(3, '0')}</h1>
        <h1 className={`text-[40px] font-bold text-[#d8ddca] ${highScore > 0 ? 'block' : 'hidden'}`}>
          {highScore.toString().padStart(3, '0')}
        </h1>
      </div>
      <div className="game-border-1 border-[#595f43] border-[10px] rounded-[30px] shadow-[inset_0_0_0_10px_#595f43]">
        <div className="game-border-2 border-[#abb78a] border-[8px] rounded-[26px] shadow-[inset_0_0_0_10px_#abb78a]">
          <div className="game-border-3 border-[#8b966c] border-[30px] rounded-[20px] shadow-[inset_0_0_0_5px_#8b966c] bg-[#c4cfa3]">
            <div
              className="grid grid-cols-[repeat(20,20px)] grid-rows-[repeat(20,20px)] m-[5px] rounded-[100px]"
              id="game-board"
            >
              {drawSnake()}
              {drawFood()}
            </div>
          </div>
        </div>
      </div>
      
      <img
        id="logo"
        className={`absolute bg-[#c4cfa3] ${gameStarted ? 'hidden' : 'block'}`}
        src={logo}
        alt="snake-logo"
      />
      <h1
        className={`absolute top-[60%] text-[#333] w-[300px] text-center capitalize p-[30px] `}>
        {gameStarted ? " " : "Press spacebar to start the game"}
      </h1>
    </div>
  );
};

export default SnakeGame;