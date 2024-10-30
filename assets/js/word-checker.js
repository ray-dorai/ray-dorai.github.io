import React, { useState, useRef, useCallback } from 'react';

const WordChecker = () => {
  // Initialize WordSet only once
  const wordsRef = useRef(null);
  const editorRef = useRef(null);
  const markTimer = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simple but efficient stemmer
  const stem = useCallback((word) => {
    word = word.toLowerCase();
    
    // Handle basic suffixes
    if (word.endsWith('ing')) return word.slice(0, -3);
    if (word.endsWith('ed')) return word.slice(0, -2);
    if (word.endsWith('s')) return word.slice(0, -1);
    return word;
  }, []);

  // Initialize word set only once
  React.useEffect(() => {
    if (!wordsRef.current) {
      class WordSet {
        constructor() {
          this.words = new Set();
        }
        
        add(words) {
          words.forEach(word => this.words.add(word.toLowerCase()));
        }
        
        has(word) {
          word = word.toLowerCase();
          return this.words.has(word) || this.words.has(stem(word));
        }
      }

      wordsRef.current = new WordSet();
      // Add common words
      wordsRef.current.add(`the of to and a in is it you that he was for on are with as I his they be at one have this from or had by word but what some we can out other were all there when up use your how said an each she which do their time if will way about many then them write would like so these her long make thing see him two has look more day could go come did number sound no most people my over know water than call first who may down side been now find any new work part take get place made live where after back little only round man year came show every good me give our under name very through just form sentence great think say help low line differ turn cause much mean before move right boy old too same tell does set three want air well also play small end put home read hand port large spell add even land here must big high such follow act why ask men change went light kind off need house picture try us again animal point mother world near build self earth father head stand own page should country found answer school grow study still learn plant cover food sun four between state keep eye never last let thought city tree cross farm hard start might story saw far sea draw left late run don't while press close night real life few north open seem together next white children begin got walk example ease paper group always music those both mark often letter until mile river car feet care second book carry took science eat room friend began idea fish mountain stop once base hear horse cut sure watch color face wood main enough plain girl usual young ready above ever red list though feel talk bird soon body dog family direct pose leave song measure door product black short numeral class wind question happen complete ship area half rock order fire south problem piece told knew pass since top whole king space heard best hour better true`.split(/\s+/));
    }
  }, [stem]);

  const markWords = useCallback(() => {
    if (markTimer.current) clearTimeout(markTimer.current);
    if (isProcessing) return;

    markTimer.current = setTimeout(() => {
      const root = editorRef.current;
      if (!root) return;

      setIsProcessing(true);

      try {
        const range = document.createRange();
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        
        // Clear old marks in a more efficient way
        const marks = root.getElementsByClassName('word-mark');
        while (marks.length > 0) {
          const mark = marks[0];
          const text = document.createTextNode(mark.textContent);
          mark.parentNode.replaceChild(text, mark);
        }
        root.normalize();
        
        // Mark unknown words with better performance
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
    }, 250); // Increased debounce time for better performance
  }, [isProcessing]);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex gap-4 items-center">
        <h1 className="text-2xl font-bold">Simple Writing Checker</h1>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={markWords}
        className="min-h-48 p-4 border rounded focus:outline-none whitespace-pre-wrap bg-white"
        placeholder="Type here..."
      />
      <div className="text-sm text-gray-500">
        Words not in the 1000 most common English words will be marked with a red underline
      </div>
    </div>
  );
};

export default WordChecker;
