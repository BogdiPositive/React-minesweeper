import React, { useState, useEffect } from "react";
import "./App.scss";
import Display from "../NumberDisplay/Display";
import { generateCells, openMultipleCells } from "../utils";
import Button from "../Button/Button";
import { Face, Cell, CellState, CellValue } from "../../types";
import { MAX_ROWS, MAX_COLS } from "../../constants";

const App: React.FC = () => {
  const [cells, setCells] = useState<Cell[][]>(generateCells());
  const [face, setFace] = useState<Face>(Face.smile);
  const [time, setTime] = useState<number>(0);
  const [alive, setAlive] = useState<boolean>(false);
  const [minCounter, setMinCounter] = useState<number>(40);
  const [hasLost, setHasLost] = useState<boolean>(false);
  const [hasWon , setHasWon] = useState<boolean>(false);

  //  Отслеживания клика ЛКМ

  const handleCellClick = (rowParam: number, colParam: number) => (): void => {
    if(hasLost){
      return
    }
    let newCells = cells.slice();

    // Старт игры
    if (!alive) {
      let isAMin = newCells[rowParam][colParam].value === CellValue.min;
      while (isAMin) {
        newCells = generateCells();
        if (newCells[rowParam][colParam].value !== CellValue.min) {
          isAMin = false;
          break;
        }
      }
      setAlive(true);
    }

    const currentCell = newCells[rowParam][colParam];

    if ([CellState.flagged, CellState.visible].includes(currentCell.state)) {
      return;
    }
        // мина 
    if (currentCell.value === CellValue.min) {
      setHasLost(true);
      setAlive(false)
      newCells[rowParam][colParam].red = true;
      newCells = showAllMins();
      setCells(newCells);
      return;
    } else if (currentCell.value === CellValue.none) {
      newCells = openMultipleCells(newCells, rowParam, colParam);
    } else {
      newCells[rowParam][colParam].state = CellState.visible;
    }

    //  

    // Проверка победы
    let safeOpenCellsExists = false;
    for (let row = 0; row < MAX_ROWS; row++) {
      for (let col = 0; col < MAX_COLS; col++) {
        const currentCell = newCells[row][col];

        if (
          currentCell.value !== CellValue.min &&
          currentCell.state === CellState.open
        ) {
          safeOpenCellsExists = true;
          break;
        }
      }
    }

    if (!safeOpenCellsExists) {
      newCells = newCells.map(row =>
        row.map(cell => {
          if (cell.value === CellValue.min) {
            return {
              ...cell,
              state: CellState.flagged
            };
          }
          return cell;
        })
      );
      setHasWon(true);
    }

    setCells(newCells);
  };

  // Отслеживание клика ПКМ

  const handleCellContext =  (rowParam : number, colParam: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) : void=> {
      e.preventDefault();
      if(!alive){
    return;
      }  
      
      const currentCells = cells.slice()
      const currentCell = cells[rowParam][colParam]
      if(currentCell.state === CellState.visible){
        return
      } 
      // Ставим флаг
      else if (currentCell.state === CellState.open){
        currentCells[rowParam][colParam].state = CellState.flagged
        setCells(currentCells);
        setMinCounter(minCounter - 1)

        //  Ставим вопрос
      } else if  ( currentCell.state === CellState.flagged) {
        currentCells[rowParam][colParam].state = CellState.question
        setCells(currentCells)
        setMinCounter(minCounter + 1);


        //  Убираем вопрос
      } else if  ( currentCell.state === CellState.question) {
        currentCells[rowParam][colParam].state = CellState.open
        setCells(currentCells)
        
     }
    }

  
  //  рендер поля
  const renderCells = (): React.ReactNode => {
    return cells.map((row, rowIndex) =>
      row.map((cell, colIndex) => (
        <Button
          key={`${rowIndex}-${colIndex}`}
          state={cell.state}
          value={cell.value}
          red={cell.red}
          onClick={handleCellClick}
          onContext={handleCellContext}
          row={rowIndex}
          col={colIndex}
        />
      ))
    );
  };

  // Рендер всех мин после конца игры

  const showAllMins = (): Cell[][] => {
   const currentCells = cells.slice();
   return  currentCells.map(row => row.map(cell => {
    if(cell.value === CellValue.min) {
      return {
        ...cell,
         state: CellState.visible
      }
    }
    return cell
   }))
  }

  // Клик по смайлу
 const handleFaceClick = (): void => {
  setAlive(false);
  setTime(0);
  setCells(generateCells())
  setMinCounter(40)
  setHasLost(false)
  setHasWon(false)
 
 }

//  Отслеживание кликов
  useEffect(() => {
    const handleMouseDown = (): void => {
      setFace(Face.ohFace);
    };
    const handleMouseUp = (): void => {
      setFace(Face.smile);
    };
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Отслеживание таймера

  useEffect(()=>{
    if (alive && time < 999){
     const timer = setInterval(() =>{ setTime(time + 1)} , 1000)
     return  () => {
      clearInterval(timer)
     }
    }
  },[alive , time])

//  Отслеживание проигрыша
  useEffect(() => {
    if(hasLost) {
      setFace(Face.rip)
      setAlive(false)
    }
  }, [hasLost])


  // отслеживание выигрыша 
  useEffect(() => {
    if(hasWon) {
      setAlive(false)
      setFace(Face.winner)
    }
  },[hasWon])

  return (
    <div className="App">
      <div className="Header">
        <Display value={minCounter} />
        <div className="Face" onClick={handleFaceClick}>
          <span role="img" aria-label="face">
            {face}
          </span>
        </div>
        <Display value={time} />
      </div>
      <div className="Body">{renderCells()}</div>
    </div>
  );
};

export default App;
