import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import './styles.css';

export const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Reference to the file input
  const fileInputRef = useRef(null);
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      processSelectedFile(file);
    }
  };

  // Handle click on the upload area
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        processSelectedFile(file);
      }
    }
  };
  
  const processSelectedFile = (file) => {
    setSelectedFile(file);
    setError(null);
    setResults(null);
    setPreview(URL.createObjectURL(file));
  };
  
  // Clear the state
  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreview(null);
    setResults(null);
    setError(null);
  };
  
  // Analyze the image once it's selected
  useEffect(() => {
    if (!preview) return;
    
    const analyzeImage = async () => {
      setIsAnalyzing(true);
      setError(null);
      
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        const response = await axios({
          method: "post",
          url: "https://micti-potato-disease-classification.hf.space/predict/",
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.status === 200) {
          setResults({
            condition: response.data.prediction,
            confidence: 98 // Fixed confidence as API doesn't provide it
          });
        }
      } catch (err) {
        console.error("Analysis error:", err);
        setError("We couldn't analyze this image. Please try with another photo of a potato leaf.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    
    analyzeImage();
  }, [preview, selectedFile]);
  
  // Determine condition status for styling
  const getConditionClass = () => {
    if (!results) return '';
    return results.condition === 'Healthy' ? 'healthy' : 'disease';
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <svg viewBox="0 0 24 24" className="leaf-icon" aria-hidden="true">
            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
          </svg>
          <h1>Potato Doc</h1>
        </div>
      </header>
      
      <main className="main-container">
        <section className="hero">
          <h2>Potato Disease Detection</h2>
          <p>Upload a photo of potato plant leaves for instant AI-powered disease detection</p>
        </section>
        
        <section className="analysis-container">
          <div 
            className={`upload-area ${dragActive ? 'active' : ''} ${preview ? 'has-image' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={!preview ? handleUploadClick : undefined}
          >
            
            {!preview && (
              <div className="upload-prompt">
                <svg className="upload-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.35,10.04C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.04C2.34,8.36 0,10.91 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.04M19,18H6A4,4 0 0,1 2,14C2,11.95 3.53,10.24 5.56,10.03L6.63,9.92L7.13,8.97C8.08,7.14 9.94,6 12,6C14.62,6 16.88,7.86 17.39,10.43L17.69,11.93L19.22,12.04C20.78,12.14 22,13.45 22,15A3,3 0 0,1 19,18M8,13H10.55V16H13.45V13H16L12,9L8,13Z" />
                </svg>
                <p className="upload-text">
                  Drag & drop a leaf image or 
                  <label className="file-label">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    browse
                  </label>
                </p>
              </div>
            )}
            
            {preview && !isAnalyzing && !results && !error && (
              <div className="analyzing-placeholder">
                <div className="pulse-dot"></div>
                <p>Analyzing image...</p>
              </div>
            )}
            
            {preview && (
              <img src={preview} alt="Uploaded potato leaf" className="preview-image" />
            )}
          </div>
          
          {isAnalyzing && (
            <div className="analyzing">
              <div className="spinner" aria-label="Analyzing"></div>
              <p>Analyzing your leaf image...</p>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              <svg viewBox="0 0 24 24" className="error-icon" aria-hidden="true">
                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
              </svg>
              <p>{error}</p>
              <button className="button secondary" onClick={resetAnalysis}>Try Again</button>
            </div>
          )}
          
          {results && (
            <div className={`results ${getConditionClass()}`}>
              <div className="result-header">
                <svg viewBox="0 0 24 24" className="result-icon" aria-hidden="true">
                  {results.condition === 'Healthy' 
                    ? <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                    : <path d="M8,2A2,2 0 0,1 10,4V20A2,2 0 0,1 8,22A2,2 0 0,1 6,20V4A2,2 0 0,1 8,2M16,2A2,2 0 0,1 18,4V20A2,2 0 0,1 16,22A2,2 0 0,1 14,20V4A2,2 0 0,1 16,2Z" />
                  }
                </svg>
                <h3>{results.condition}</h3>
                <span className="confidence">{results.confidence}% confidence</span>
              </div>
              
              <div className="result-details">
                {results.condition !== 'Healthy' ? (
                  <>
                    <p>This leaf shows signs of <strong>{results.condition}</strong>. Early treatment is recommended.</p>
                    <div className="recommendation">
                      <h4>Recommended Action</h4>
                      <ul>
                        <li>Remove affected leaves to prevent spread</li>
                        <li>Apply appropriate fungicide treatment</li>
                        <li>Ensure proper air circulation between plants</li>
                        <li>Avoid overhead watering to reduce moisture on leaves</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <p>Good news! Your potato plant appears to be healthy. Continue with your current care routine.</p>
                    <div className="recommendation">
                      <h4>Maintenance Tips</h4>
                      <ul>
                        <li>Monitor regularly for early signs of disease</li>
                        <li>Maintain good watering practices</li>
                        <li>Ensure plants receive appropriate nutrients</li>
                        <li>Practice crop rotation in future plantings</li>
                      </ul>
                    </div>
                  </>
                )}
                
                <button onClick={resetAnalysis} className="button">
                  Analyze Another Image
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
      
      <footer className="footer">
        <p>© 2025 Potato Doc | AI-powered plant disease detection</p>
        <p className="footer-note">Developed by Satwik & Arpit</p>
      </footer>
    </div>
  );
};