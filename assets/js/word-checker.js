const WordChecker = ({ wordsPath }) => {
  const [state, setState] = React.useState({
    isLoading: true,
    error: null,
    wordCount: 0,
    isProcessing: false
  });
  
  const words = React.useRef(new Set());
  const editor = React.useRef(null);
  const markTimeout = React.useRef(null);

  React.useEffect(() => {
    fetch(wordsPath)
      .then(res => res.text())
      .then(text => {
        text.split('\n')
          .filter(word => word.trim())
          .forEach(word => words.current.add(word.toLowerCase().trim()));
        setState(s => ({ ...s, isLoading: false }));
      })
      .catch(error => {
        console.error('Failed to load words:', error);
        setState(s => ({ 
          ...s, 
          isLoading: false, 
          error: 'Failed to load word list. Please try again later.' 
        }));
      });
  }, [wordsPath]);

  const checkText = React.useCallback(() => {
    if (markTimeout.current) clearTimeout(markTimeout.current);
    if (!editor.current || state.isProcessing) return;

    markTimeout.current = setTimeout(() => {
      setState(s => ({ ...s, isProcessing: true }));
      
      try {
        const root = editor.current;
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const cursorOffset = range.startOffset;
        const cursorNode = range.startContainer;
        
        // Store text content before clearing marks
        const allText = root.textContent;
        
        // Clear existing marks
        root.querySelectorAll('.word-mark').forEach(mark => {
          mark.replaceWith(document.createTextNode(mark.textContent));
        });
        root.normalize();
        
        // Count words and find unknown ones
        let wordCount = 0;
        const text = allText;
        const regex = /\b\w+\b/g;
        let match;
        const unknownWords = [];
        
        while ((match = regex.exec(text)) !== null) {
          wordCount++;
          const word = match[0].toLowerCase();
          if (!words.current.has(word)) {
            unknownWords.push({
              word: match[0],
              index: match.index,
              length: match[0].length
            });
          }
        }
        
        // Mark unknown words from end to start to preserve text positions
        for (let i = unknownWords.length - 1; i >= 0; i--) {
          const { word, index, length } = unknownWords[i];
          const textNode = root.firstChild;
          
          if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            const markRange = document.createRange();
            markRange.setStart(textNode, index);
            markRange.setEnd(textNode, index + length);
            
            const mark = document.createElement('span');
            mark.className = 'word-mark border-b-2 border-red-500';
            markRange.surroundContents(mark);
          }
        }
        
        // Restore cursor position
        if (cursorNode) {
          const newRange = document.createRange();
          const newNode = root.firstChild;
          
          if (newNode) {
            const offset = Math.min(cursorOffset, newNode.textContent.length);
            newRange.setStart(newNode, offset);
            newRange.setEnd(newNode, offset);
            
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }
        
        setState(s => ({ ...s, wordCount }));
      } finally {
        setState(s => ({ ...s, isProcessing: false }));
      }
    }, 250);
  }, [state.isProcessing]);

  if (state.error) {
    return <div className="text-red-600 p-4">{state.error}</div>;
  }

  if (state.isLoading) {
    return <div className="text-gray-500 p-4">Loading word list...</div>;
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <header className="mb-4 flex items-center gap-4">
        <h1 className="text-2xl font-bold">Writing Checker</h1>
        {state.isProcessing && (
          <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
      </header>
      
      <div
        ref={editor}
        contentEditable
        onInput={checkText}
        className="min-h-48 p-4 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent whitespace-pre-wrap bg-white"
        placeholder="Type here..."
      />
      
      <footer className="mt-4 flex justify-between text-sm text-gray-600">
        <p>Uncommon words will be underlined in red.</p>
        <p>Words: {state.wordCount}</p>
      </footer>
    </main>
  );
};
