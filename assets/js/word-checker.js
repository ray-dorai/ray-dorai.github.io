// Word Checker Component with Stemming
const WordChecker = () => {
  // Simple stemmer for English words
  const stem = (word) => {
    word = word.toLowerCase();
    
    // Handle irregular plurals first
    const irregularPluralMap = {
      'children': 'child',
      'men': 'man',
      'women': 'woman',
      'people': 'person',
      'lives': 'life',
      'wives': 'wife',
      'leaves': 'leaf',
      'mice': 'mouse',
      'teeth': 'tooth'
    };
    
    if (irregularPluralMap[word]) {
      return irregularPluralMap[word];
    }
    
    // Common suffixes and rules
    if (word.endsWith('ing')) {
      // doubling rule: running -> run
      if (word.length > 6 && word.slice(-7, -3) === word.slice(-8, -4)) {
        return word.slice(0, -4);
      }
      // dropping 'e': taking -> take
      if (word.length > 4) {
        const stemmed = word.slice(0, -3);
        if (!stemmed.endsWith('e')) {
          return stemmed + 'e';
        }
        return stemmed;
      }
    }
    
    if (word.endsWith('ed')) {
      // doubling rule: dropped -> drop
      if (word.length > 5 && word.slice(-6, -2) === word.slice(-7, -3)) {
        return word.slice(0, -3);
      }
      // dropping 'e': liked -> like
      if (word.length > 3) {
        const stemmed = word.slice(0, -2);
        if (!stemmed.endsWith('e')) {
          return stemmed + 'e';
        }
        return stemmed;
      }
    }
    
    if (word.endsWith('s')) {
      // handles: drops -> drop, wishes -> wish
      if (word.endsWith('es') && word.length > 3) {
        // Special cases for -es
        if (word.endsWith('ies')) {
          return word.slice(0, -3) + 'y';
        }
        return word.slice(0, -2);
      }
      // Simple plural
      if (word.length > 2) {
        return word.slice(0, -1);
      }
    }
    
    // Handle comparatives and superlatives
    if (word.endsWith('er') || word.endsWith('est')) {
      const base = word.slice(0, word.endsWith('er') ? -2 : -3);
      // doubling rule: bigger -> big
      if (base.length > 2 && base.slice(-1) === base.slice(-2, -1)) {
        return base.slice(0, -1);
      }
      return base;
    }

    return word;
  };

  // Common words list (unchanged)
  const COMMON_WORDS = `the
of
to
and
a
in
is
it
you
that
he
was
for
on
are
with
as
I
his
they
be
at
one
have
this
from
or
had
by
word
but
what
some
we
can
out
other
were
all
there
when
up
use
your
how
said
an
each
she
which
do
their
time
if
will
way
about
many
then
them
write
would
like
so
these
her
long
make
thing
see
him
two
has
look
more
day
could
go
come
did
number
sound
no
most
people
my
over
know
water
than
call
first
who
may
down
side
been
now
find
any
new
work
part
take
get
place
made
live
where
after
back
little
only
round
man
year
came
show
every
good
me
give
our
under
name
very
through
just
form
sentence
great
think
say
help
low
line
differ
turn
cause
much
mean
before
move
right
boy
old
too
same
tell
does
set
three
want
air
well
also
play
small
end
put
home
read
hand
port
large
spell
add
even
land
here
must
big
high
such
follow
act
why
ask
men
change
went
light
kind
off
need
house
picture
try
us
again
animal
point
mother
world
near
build
self
earth
father
head
stand
own
page
should
country
found
answer
school
grow
study
still
learn
plant
cover
food
sun
four
between
state
keep
eye
never
last
let
thought
city
tree
cross
farm
hard
start
might
story
saw
far
sea
draw
left
late
run
don't
while
press
close
night
real
life
few
north
open
seem
together
next
white
children
begin
got
walk
example
ease
paper
group
always
music
those
both
mark
often
letter
until
mile
river
car
feet
care
second
book
carry
took
science
eat
room
friend
began
idea
fish
mountain
stop
once
base
hear
horse
cut
sure
watch
color
face
wood
main
enough
plain
girl
usual
young
ready
above
ever
red
list
though
feel
talk
bird
soon
body
dog
family
direct
pose
leave
song
measure
door
product
black
short
numeral
class
wind
question
happen
complete
ship
area
half
rock
order
fire
south
problem
piece
told
knew
pass
since
top
whole
king
space
heard
best
hour
better
true`.split('\n').map(w => w.trim()).filter(w => w);

  class WordSet {
    constructor() {
      this.data = new Uint32Array(2048); // 65536 bits
    }
    
    add(words) {
      for (const word of words) {
        const hash = this.hash(word.toLowerCase());
        this.data[hash >>> 5] |= 1 << (hash & 31);
      }
    }
    
    has(word) {
      // First try the word as is
      const hash = this.hash(word.toLowerCase());
      if ((this.data[hash >>> 5] & (1 << (hash & 31))) !== 0) return true;
      
      // If not found, try the stemmed version
      const stemmedHash = this.hash(stem(word.toLowerCase()));
      return (this.data[stemmedHash >>> 5] & (1 << (stemmedHash & 31))) !== 0;
    }
    
    hash(str) {
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h + str.charCodeAt(i)) | 0;
      }
      return (h >>> 0) % 65536;
    }

    clear() {
      this.data.fill(0);
    }
  }

  const editorRef = React.useRef(null);
  const wordsRef = React.useRef(new WordSet());
  const markTimer = React.useRef(null);

  // Initialize the word set
  React.useEffect(() => {
    wordsRef.current.clear();
    wordsRef.current.add(COMMON_WORDS);
  }, []);

  const markWords = () => {
    if (markTimer.current) clearTimeout(markTimer.current);
    
    markTimer.current = setTimeout(() => {
      const root = editorRef.current;
      if (!root) return;

      const range = document.createRange();
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      
      // Clear old marks
      root.querySelectorAll('.word-mark').forEach(m => {
        const parent = m.parentNode;
        parent.replaceChild(document.createTextNode(m.textContent), m);
        parent.normalize();
      });
      
      // Mark unknown words
      let node;
      const wordReg = /\b\w+\b/g;
      while (node = walker.nextNode()) {
        let match;
        while ((match = wordReg.exec(node.textContent)) !== null) {
          const word = match[0];
          if (!wordsRef.current.has(word)) {
            range.setStart(node, match.index);
            range.setEnd(node, match.index + word.length);
            const mark = document.createElement('span');
            mark.className = 'word-mark border-b-2 border-red-500 border-wavy';
            mark.title = `Base form: ${stem(word)}`;
            range.surroundContents(mark);
          }
        }
      }
    }, 100);
  };

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
        Words not in the 1000 most common English words (including common variations) will be marked with a red underline.
        Hover over marked words to see their base form.
      </div>
    </div>
  );
};
