import React from "react";

interface LoaderProps {
  loading?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ loading = true }) => {
  if (!loading) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-div">
        <div className="loader" />
      </div>
    </div>
  );
};

export default Loader;
