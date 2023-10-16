import { lusolve, multiply, transpose } from 'mathjs';
import { SpeedAndVario } from '../pages/flightAnalysis';

export function polynomialInterpolation(data: SpeedAndVario[]) {
    if (data.length < 3) {
      return () => 0;
    }
    // Initialiser les matrices
    const X: number[][] = [];
    const Y: number[][] = [];
  
    data.forEach((point) => {
      const { speed, vario } = point;
      X.push([speed * speed, speed, 1]); // Pour une équation de la forme ax^2 + bx + c
      Y.push([vario]);
    });
  
    // Résoudre les équations linéaires pour trouver les coefficients
    const X_T = transpose(X);
    const coefficients: math.Matrix = lusolve(multiply(X_T, X) as any, multiply(X_T, Y) as any);
  
    // Fonction pour évaluer le polynôme résultant
    const evaluatePolynomial = (x: number) => {
      const coefArray: number[][] = coefficients.valueOf() as number[][];
      const a = coefArray[0][0]
      const b = coefArray[1][0]
      const c = coefArray[2][0]
      return a * x * x + b * x + c;
    };
  
    return evaluatePolynomial;
  }