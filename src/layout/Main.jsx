import React from "react";

const Main = ({ children }) => {
  return (
    <main className="overflow-y-auto grow">
      {children}
    </main>
  );
};

export default Main;
