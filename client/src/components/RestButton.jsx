import React from "react";
import styled from "styled-components";

function RestButton({ text }) {
  return <Button>{text}</Button>;
}

// Create a horizontal container for the buttons
const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px; // Adds space between buttons
  align-items: center;
`;

const Button = styled.button`
  margin-top: 15px;
  border-radius: 10px;
  padding: 12px 20px;
  background-color: #D6F49D;
  color: #664E4C;
  font-weight: bold;
  font-size: 16px;
  border: none;
  cursor: pointer;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #c8e68f;
    transform: translateY(-2px);
    box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

 export { RestButton, ButtonContainer };