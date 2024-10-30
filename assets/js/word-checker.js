const WordChecker = ({ wordsPath }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [wordCount, setWordCount] = React.useState(0);
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const wordsRef = React.useRef(null);
  const editorRef = React.useRef(null);
  const markTimer = React.useRef(null);

  // Simple stemmer with common English suffixes
  const stem = React.useCallback((word) => {
    word = word.toLowerCase();
    const suffixes = ['ing', 'ed', 's', 'es', 'ly', 'er', 'est'];
    for (const suffix of suffixes) {
      if (word.endsWith(suffix)) {
        return word.slice(0, -suffix.length);
      }
    }
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

        wordsRef.current = new WordSet();
        
        // Fetch words from the provided path
        const response = await fetch(wordsPath);
        if (!response.ok) throw new Error('Failed to load word list');
        
        const text = await response.text();
        const words = text.split('\n').filter(word => word.trim());
        
        wordsRef.current.add(words);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading words:', err);
        setError('Failed to load word list. Please try again later.');
        setIsLoading(false);
      }
    };

    loadWords();
  }, [wordsPath, stem]);

  const markWords = React.useCallback(() => {
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
        
        // Count words and mark unknown ones
        let totalWords = 0;
        let node;
        const wordReg = /\b\w+\b/g;
        
        while ((node = walker.nextNode())) {
          let match;
          const text = node.textContent;
          while ((match = wordReg.exec(text)) !== null) {
            totalWords++;
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
        
        setWordCount(totalWords);
      } finally {
        setIsProcessing(false);
      }
    }, 250);
  }, [isProcessing, stem]);

  // Loading spinner component
  const Spinner = () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex gap-4 items-center">
        <h1 className="text-2xl font-bold">Simple Writing Checker</h1>
        {isProcessing && (
          <Spinner />
        )}
      </div>
      
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Spinner />
          Loading word list...
        </div>
      ) : (
        <>
          <div
            ref={editorRef}
            contentEditable
            onInput={markWords}
            className="min-h-48 p-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent whitespace-pre-wrap bg-white"
            placeholder="Type here..."
          />
          
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Words not in the 1000 most common English words will be marked with a red underline.
              Hover over marked words to see their base form.
            </div>
            <div className="font-medium">
              Words: {wordCount}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
