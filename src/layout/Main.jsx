import React from "react";

const Main = ({ children }) => {
  return (
    <main className="overflow-y-auto grow pb-5">
      {children}
    </main>
  );
};

export default Main;
