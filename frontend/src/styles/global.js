// src/styles/global.js
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background-color: #f0f2f5;
    color: #333;
    font-family: Arial, sans-serif;
  }

  h1 {
    color: #1a1a1a;
    font-size: 24px;
    margin-bottom: 20px;
  }

  button {
    cursor: pointer;
  }
`;
