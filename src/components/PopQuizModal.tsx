import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Award } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PopQuizModalProps {
  onComplete: (passed: boolean, rewardScore: number) => void;
  onClose: () => void;
}

const QUESTIONS = [
  {
    q: 'What is the chemical formula for water?',
    options: ['H2O', 'CO2', 'NaCl', 'O2'],
    answer: 0,
  },
  {
    q: 'If a triangle has sides 3 and 4 at a right angle, what is the hypotenuse?',
    options: ['5', '6', '7', '8'],
    answer: 0,
  },
  {
    q: 'Which floor in SchoolTime Academy contains the Central Library & Archives?',
    options: ['Floor 2', 'Floor 7', 'Floor 9', 'Floor 12'],
    answer: 1,
  },
  {
    q: 'What is the powerhouse organelle of the cell?',
    options: ['Ribosome', 'Mitochondria', 'Nucleus', 'Endoplasmic Reticulum'],
    answer: 1,
  },
  {
    q: 'Which planet is known as the Red Planet in our solar system?',
    options: ['Venus', 'Mars', 'Jupiter', 'Mercury'],
    answer: 1,
  },
];

export const PopQuizModal: React.FC<PopQuizModalProps> = ({ onComplete, onClose }) => {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  const currentQ = QUESTIONS[qIndex];

  useEffect(() => {
    if (isFinished || isAnswered) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleSelectOption(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [qIndex, isAnswered, isFinished]);

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.answer;
    soundManager.playQuizResult(isCorrect);
    if (isCorrect) {
      setScore((s) => s + 1);
    }

    setTimeout(() => {
      if (qIndex + 1 < QUESTIONS.length) {
        setQIndex((i) => i + 1);
        setSelectedOpt(null);
        setIsAnswered(false);
        setTimeLeft(15);
      } else {
        setIsFinished(true);
        const finalScore = score + (isCorrect ? 1 : 0);
        soundManager.playQuestComplete();
        onComplete(finalScore >= 3, finalScore);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border-2 border-emerald-500 text-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header styled like a classroom chalkboard */}
        <div className="px-6 py-4 bg-emerald-950 border-b border-emerald-800 flex items-center justify-between">
          <div>
            <h3 className="font-mono font-black text-xl text-emerald-300">
              POP QUIZ! ★ NO TALKING
            </h3>
            <p className="text-xs text-emerald-400/80">Question {qIndex + 1} of {QUESTIONS.length}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="font-mono font-bold text-amber-300 bg-emerald-900/80 px-3 py-1 rounded-full text-xs border border-emerald-700">
              ⏳ {timeLeft}s
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-emerald-900 hover:bg-emerald-800 flex items-center justify-center text-emerald-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {!isFinished ? (
            <div className="space-y-5">
              <h4 className="font-bold text-lg text-slate-100">{currentQ.q}</h4>

              <div className="space-y-2.5">
                {currentQ.options.map((opt, i) => {
                  let btnStyle = 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-200';
                  if (isAnswered) {
                    if (i === currentQ.answer) {
                      btnStyle = 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-300';
                    } else if (i === selectedOpt) {
                      btnStyle = 'bg-red-600 border-red-400 text-white';
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(i)}
                      className={`w-full p-3.5 rounded-2xl border text-left font-bold text-sm transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>
                        <span className="font-mono text-xs opacity-75 mr-2">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {opt}
                      </span>
                      {isAnswered && i === currentQ.answer && (
                        <CheckCircle className="w-5 h-5 text-emerald-200" />
                      )}
                      {isAnswered && i === selectedOpt && i !== currentQ.answer && (
                        <AlertCircle className="w-5 h-5 text-red-200" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <Award className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
              <h4 className="text-2xl font-black">
                {score >= 3 ? 'QUIZ PASSED! Grade: A' : 'QUIZ FAILED! Grade: F'}
              </h4>
              <p className="text-sm text-slate-300">
                You answered {score} out of {QUESTIONS.length} questions correctly.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm"
              >
                RETURN TO CLASS
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
