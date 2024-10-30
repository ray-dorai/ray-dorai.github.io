import React, { useState, useRef, useCallback } from 'react';

const WordChecker = () => {
  const wordsRef = useRef(null);
  const editorRef = useRef(null);
  const markTimer = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simple stemmer
  const stem = useCallback((word) => {
    word = word.toLowerCase();
    if (word.endsWith('ing')) return word.slice(0, -3);
    if (word.endsWith('ed')) return word.slice(0, -2);
    if (word.endsWith('s')) return word.slice(0, -1);
    return word;
  }, []);

  // Initialize word set from file
  React.useEffect(() => {
    const loadWords = async () => {
      try {
        class WordSet {
          constructor() {
            this.words = new Set();
          }
          
          add(words) {
            words.forEach(word => {
              const trimmed = word.trim().toLowerCase();
              if (trimmed) this.words.add(trimmed);
            });
          }
          
          has(word) {
            word = word.toLowerCase();
            return this.words.has(word) || this.words.has(stem(word));
          }
        }

        // Create new WordSet instance
        wordsRef.current = new WordSet();
        
        // Fetch the word list file from your repository
        const response = await fetch('{{ site.baseurl }}/assets/words/1000-most-common-words.txt');
        if (!response.ok) throw new Error('Failed to load word list');
        
        const text = await response.text();
        // Split on newlines and filter out empty lines
        const words = text.split('\n').filter(word => word.trim());
        
        // Add words to our set
        wordsRef.current.add(words);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading words:', err);
        setError('Failed to load word list. Please try again later.');
        setIsLoading(false);
      }
    };

    loadWords();
  }, [stem]);

  const markWords = useCallback(() => {
    if (markTimer.current) clearTimeout(markTimer.current);
    if (isProcessing || !wordsRef.current) return;

    markTimer.current = setTimeout(() => {
      const root = editorRef.current;
      if (!root) return;

      setIsProcessing(true);

      try {
        const range = document.createRange();
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        
        // Clear old marks
        const marks = root.getElementsByClassName('word-mark');
        while (marks.length > 0) {
          const mark = marks[0];
          const text = document.createTextNode(mark.textContent);
          mark.parentNode.replaceChild(text, mark);
        }
        root.normalize();
        
        // Mark unknown words
        let node;
        const wordReg = /\b\w+\b/g;
        while ((node = walker.nextNode())) {
          let match;
          const text = node.textContent;
          while ((match = wordReg.exec(text)) !== null) {
            const word = match[0];
            if (!wordsRef.current.has(word)) {
              try {
                range.setStart(node, match.index);
                range.setEnd(node, match.index + word.length);
                const mark = document.createElement('span');
                mark.className = 'word-mark border-b-2 border-red-500';
                mark.title = `Base form: ${stem(word)}`;
                range.surroundContents(mark);
              } catch (e) {
                console.warn('Marking failed for word:', word);
              }
            }
          }
        }
      } finally {
        setIsProcessing(false);
      }
    }, 250);
  }, [isProcessing, stem]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex gap-4 items-center">
        <h1 className="text-2xl font-bold">Simple Writing Checker</h1>
      </div>
      {isLoading ? (
        <div className="text-gray-500">Loading word list...</div>
      ) : (
        <>
          <div
            ref={editorRef}
            contentEditable
            onInput={markWords}
            className="min-h-48 p-4 border rounded focus:outline-none whitespace-pre-wrap bg-white"
            placeholder="Type here..."
          />
          <div className="text-sm text-gray-500">
            Words not in the 1000 most common English words will be marked with a red underline.
            Hover over marked words to see their base form.
          </div>
        </>
      )}
    </div>
  );
};

export default WordChecker;
