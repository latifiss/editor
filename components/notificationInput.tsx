'use client';

import React from "react";

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeHolder?: string;
}

const NotificationInput: React.FC<InputProps> = ({ value, onChange, placeHolder }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeHolder}
    className="input"
  />
);

export default NotificationInput;
