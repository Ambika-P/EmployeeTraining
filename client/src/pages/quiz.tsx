import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useLocation, Link } from "wouter";
import { ChevronLeft, ChevronRight, Clock, Check, X, AlertTriangle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface Question {
  id: number;
  text: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

export default function Quiz() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Parse query parameters from URL
  const queryParams = new URLSearchParams(location.split("?")[1]);
  const courseId = queryParams.get("courseId") || "1";
  const moduleId = queryParams.get("moduleId") || "2";
  const quizId = queryParams.get("quizId") || "js-basics-quiz";
  
  // Mock data for demonstration
  const quizData = {
    id: quizId,
    title: "JavaScript Basics Quiz",
    description: "Test your knowledge of JavaScript basics including variables, data types, operators, and control flow.",
    timeLimit: 15, // minutes
    passingScore: 70, // percent
    questions: [
      {
        id: 1,
        text: "Which of the following is NOT a JavaScript data type?",
        options: [
          { id: "a", text: "String" },
          { id: "b", text: "Integer" },
          { id: "c", text: "Boolean" },
          { id: "d", text: "Undefined" }
        ],
        correctAnswer: "b",
        explanation: "JavaScript has Number type instead of Integer and Float. The available primitive data types are: String, Number, Boolean, Undefined, Null, Symbol, and BigInt."
      },
      {
        id: 2,
        text: "What is the correct way to create a variable in JavaScript?",
        options: [
          { id: "a", text: "var name = value;" },
          { id: "b", text: "variable name = value;" },
          { id: "c", text: "v name = value;" },
          { id: "d", text: "const name : value;" }
        ],
        correctAnswer: "a",
        explanation: "Variables in JavaScript can be declared using var, let, or const. The correct syntax is 'var name = value;', 'let name = value;', or 'const name = value;'."
      },
      {
        id: 3,
        text: "Which operator is used for strict equality comparison in JavaScript?",
        options: [
          { id: "a", text: "==" },
          { id: "b", text: "===" },
          { id: "c", text: "=" },
          { id: "d", text: "!==" }
        ],
        correctAnswer: "b",
        explanation: "The strict equality operator (===) checks for equality in both value and type, without performing type conversion."
      },
      {
        id: 4,
        text: "What will be the output of the following code?\n\nconsole.log(typeof [])",
        options: [
          { id: "a", text: "array" },
          { id: "b", text: "object" },
          { id: "c", text: "list" },
          { id: "d", text: "undefined" }
        ],
        correctAnswer: "b",
        explanation: "In JavaScript, arrays are objects. So typeof [] returns 'object'."
      },
      {
        id: 5,
        text: "Which statement is used to exit a loop in JavaScript?",
        options: [
          { id: "a", text: "exit" },
          { id: "b", text: "return" },
          { id: "c", text: "break" },
          { id: "d", text: "stop" }
        ],
        correctAnswer: "c",
        explanation: "The break statement is used to exit a loop in JavaScript. It terminates the current loop and transfers control to the statement following the terminated loop."
      },
      {
        id: 6,
        text: "Which of the following is a proper way to write a JavaScript comment?",
        options: [
          { id: "a", text: "/* This is a comment */" },
          { id: "b", text: "// This is a comment" },
          { id: "c", text: "<!-- This is a comment -->" },
          { id: "d", text: "Both A and B" }
        ],
        correctAnswer: "d",
        explanation: "JavaScript supports both single-line comments using // and multi-line comments using /* */."
      },
      {
        id: 7,
        text: "What does the isNaN() function do in JavaScript?",
        options: [
          { id: "a", text: "Returns true if the argument is not a number" },
          { id: "b", text: "Converts the argument to a number" },
          { id: "c", text: "Checks if the argument is NULL" },
          { id: "d", text: "Returns the negative value of the argument" }
        ],
        correctAnswer: "a",
        explanation: "The isNaN() function determines whether a value is NaN (Not-a-Number) or not. It returns true if the value is NaN, and false otherwise."
      },
      {
        id: 8,
        text: "Which of the following is NOT a JavaScript loop?",
        options: [
          { id: "a", text: "for" },
          { id: "b", text: "while" },
          { id: "c", text: "foreach" },
          { id: "d", text: "do-while" }
        ],
        correctAnswer: "c",
        explanation: "JavaScript has for, while, and do-while loops. There is no built-in foreach loop, but there is a forEach() method for arrays."
      },
      {
        id: 9,
        text: "What is the result of the expression: '5' + 2?",
        options: [
          { id: "a", text: "7" },
          { id: "b", text: "52" },
          { id: "c", text: "5 + 2" },
          { id: "d", text: "Error" }
        ],
        correctAnswer: "b",
        explanation: "When you use + operator with a string and another data type, JavaScript converts the other data type to a string and performs concatenation. So '5' + 2 becomes '52'."
      },
      {
        id: 10,
        text: "Which statement correctly creates a new object in JavaScript?",
        options: [
          { id: "a", text: "let obj = Object();" },
          { id: "b", text: "let obj = new Object();" },
          { id: "c", text: "let obj = {};" },
          { id: "d", text: "All of the above" }
        ],
        correctAnswer: "d",
        explanation: "All three statements are valid ways to create a new empty object in JavaScript."
      }
    ]
  };
  
  // State for quiz
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | null>>({});
  const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit * 60); // seconds
  const [quizState, setQuizState] = useState<'intro' | 'inProgress' | 'review' | 'completed'>('intro');
  
  // Timer effect
  useEffect(() => {
    if (quizState !== 'inProgress') return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quizState]);
  
  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Current question
  const currentQuestion = quizData.questions[currentQuestionIndex];
  
  // Calculate progress
  const progress = Math.round(((currentQuestionIndex + 1) / quizData.questions.length) * 100);
  
  // Handle selecting an answer
  const handleSelectAnswer = (questionId: number, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };
  
  // Handle navigation
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Handle starting the quiz
  const handleStartQuiz = () => {
    setQuizState('inProgress');
  };
  
  // Handle submitting the quiz
  const handleSubmitQuiz = () => {
    // Calculate score
    const answeredQuestions = Object.keys(answers).length;
    
    if (answeredQuestions < quizData.questions.length) {
      toast({
        title: "Quiz Incomplete",
        description: `You've only answered ${answeredQuestions} out of ${quizData.questions.length} questions.`,
        variant: "destructive",
      });
      return;
    }
    
    setQuizState('review');
  };
  
  // Handle finishing the review
  const handleFinishReview = () => {
    setQuizState('completed');
  };
  
  // Calculate score
  const calculateScore = () => {
    let correctAnswers = 0;
    quizData.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return {
      correctAnswers,
      totalQuestions: quizData.questions.length,
      percentage: Math.round((correctAnswers / quizData.questions.length) * 100)
    };
  };
  
  const score = calculateScore();
  const isPassing = score.percentage >= quizData.passingScore;
  
  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href={`/course-content?id=${courseId}&moduleId=${moduleId}&lessonId=7`}>
              <a className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Course
              </a>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        {quizState === 'intro' && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{quizData.title}</CardTitle>
              <CardDescription>{quizData.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold mb-2">{quizData.questions.length}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Questions</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold mb-2">{quizData.timeLimit} min</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Time Limit</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold mb-2">{quizData.passingScore}%</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Passing Score</div>
                </div>
              </div>
              
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 text-sm">
                  <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Quiz Instructions</h3>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>You have {quizData.timeLimit} minutes to complete all {quizData.questions.length} questions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>You must score at least {quizData.passingScore}% to pass the quiz.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>You can navigate between questions using the Previous and Next buttons.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Your answers are saved as you navigate between questions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>You can attempt this quiz up to 3 times.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button size="lg" onClick={handleStartQuiz}>
                Start Quiz
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {quizState === 'inProgress' && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>{quizData.title}</CardTitle>
                  <CardDescription>
                    Question {currentQuestionIndex + 1} of {quizData.questions.length}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm font-medium">{formatTime(timeRemaining)} remaining</span>
                </div>
              </div>
              <Progress value={progress} className="mt-2" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
                  
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => (
                      <div 
                        key={option.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          answers[currentQuestion.id] === option.id
                            ? "border-primary bg-primary/5"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                        onClick={() => handleSelectAnswer(currentQuestion.id, option.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                            answers[currentQuestion.id] === option.id
                              ? "border-primary"
                              : "border-slate-300 dark:border-slate-600"
                          }`}>
                            {answers[currentQuestion.id] === option.id && (
                              <div className="h-3 w-3 rounded-full bg-primary"></div>
                            )}
                          </div>
                          <label className="cursor-pointer">{option.text}</label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t">
              <Button 
                variant="outline" 
                onClick={handlePreviousQuestion} 
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentQuestionIndex === quizData.questions.length - 1 ? (
                  <Button onClick={handleSubmitQuiz}>
                    Submit Quiz
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNextQuestion} 
                    disabled={!answers[currentQuestion.id]}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        )}
        
        {quizState === 'review' && (
          <Card>
            <CardHeader>
              <CardTitle>Quiz Review</CardTitle>
              <CardDescription>
                Review your answers before submitting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {quizData.questions.map((question, index) => (
                  <div key={question.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Question {index + 1}:</h3>
                      {answers[question.id] === question.correctAnswer ? (
                        <span className="text-green-500 dark:text-green-400 flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          Correct
                        </span>
                      ) : (
                        <span className="text-red-500 dark:text-red-400 flex items-center gap-1">
                          <X className="h-4 w-4" />
                          Incorrect
                        </span>
                      )}
                    </div>
                    <p>{question.text}</p>
                    
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div 
                          key={option.id}
                          className={`border rounded-lg p-3 ${
                            option.id === question.correctAnswer
                              ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20"
                              : option.id === answers[question.id] && option.id !== question.correctAnswer
                                ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20"
                                : "border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                              option.id === question.correctAnswer
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                : option.id === answers[question.id] && option.id !== question.correctAnswer
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            }`}>
                              {option.id === question.correctAnswer ? (
                                <Check className="h-3 w-3" />
                              ) : option.id === answers[question.id] && option.id !== question.correctAnswer ? (
                                <X className="h-3 w-3" />
                              ) : (
                                <span className="text-xs">{option.id.toUpperCase()}</span>
                              )}
                            </div>
                            <label>{option.text}</label>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-sm">
                      <div className="font-medium mb-1">Explanation:</div>
                      <div className="text-slate-600 dark:text-slate-300">{question.explanation}</div>
                    </div>
                    
                    {index < quizData.questions.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleFinishReview}>
                Complete Review
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {quizState === 'completed' && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {isPassing ? (
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                    <Check className="h-8 w-8" />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl">
                {isPassing ? "Congratulations!" : "Better Luck Next Time"}
              </CardTitle>
              <CardDescription>
                {isPassing 
                  ? `You've passed the quiz with a score of ${score.percentage}%!` 
                  : `You've scored ${score.percentage}%, but you need ${quizData.passingScore}% to pass.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold mb-2">{score.correctAnswers}/{score.totalQuestions}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Correct Answers</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg text-center">
                  <div className={`text-3xl font-bold mb-2 ${
                    isPassing ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                  }`}>
                    {score.percentage}%
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Your Score</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold mb-2">{quizData.passingScore}%</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Passing Score</div>
                </div>
              </div>
              
              {isPassing ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-800 dark:text-green-400">
                    You've successfully completed this module quiz. You can now proceed to the next module.
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900 rounded-lg p-4 text-center">
                  <p className="text-sm text-amber-800 dark:text-amber-400">
                    Don't worry! You can review the module content and try again.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant={isPassing ? "default" : "outline"}
                onClick={() => setLocation(`/course-content?id=${courseId}&moduleId=${parseInt(moduleId) + 1}&lessonId=8`)}
              >
                {isPassing ? "Continue to Next Module" : "Review Module Content"}
              </Button>
              {!isPassing && (
                <Button onClick={() => setQuizState('intro')}>
                  Retake Quiz
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}