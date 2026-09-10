import type { CourseDocument, DocumentChunk } from '../types';

export interface SampleCourseData {
  document: CourseDocument;
  chunks: DocumentChunk[];
}

export const SAMPLE_COURSES: SampleCourseData[] = [
  {
    document: {
      id: 'doc-dsa-101',
      title: 'Data Structures & Algorithms: Foundations',
      category: 'computer_science',
      description: 'Comprehensive guide to fundamental data structures, asymptotic notation, search algorithms, and dynamic programming.',
      filename: 'dsa_foundations_notes.pdf',
      uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      chunkCount: 6,
      contentSummary: 'Covers Big-O notation, Arrays, Linked Lists, Binary Search Trees, Graph Traversals (BFS/DFS), and Dynamic Programming fundamentals.'
    },
    chunks: [
      {
        id: 'dsa-chunk-1',
        documentId: 'doc-dsa-101',
        documentTitle: 'Data Structures & Algorithms: Foundations',
        chapterTitle: 'Chapter 1: Asymptotic Analysis & Big-O Notation',
        chunkIndex: 1,
        wordCount: 165,
        keywords: ['big-o', 'asymptotic', 'time complexity', 'space complexity', 'worst-case', 'omega', 'theta'],
        content: `Asymptotic analysis describes the behavior of algorithms as the input size n grows toward infinity. Big-O notation, denoted as O(g(n)), provides an upper bound on running time, guaranteeing that the algorithm will not take longer than a constant multiple of g(n) for large n. 

Common complexities from fastest to slowest include:
- O(1): Constant time, e.g., accessing an array index or push/pop on a stack.
- O(log n): Logarithmic time, characteristic of divide-and-conquer algorithms like Binary Search.
- O(n): Linear time, e.g., single traversal over an array of size n.
- O(n log n): Linearithmic time, optimal comparison-based sorting like Merge Sort and Quick Sort (average case).
- O(n^2): Quadratic time, e.g., nested loops in Bubble Sort, Insertion Sort.
- O(2^n): Exponential time, seen in naive recursive solutions for Fibonacci or Traveling Salesperson Problem.

Space complexity measures total working memory required by an algorithm, including variables and call stack depth.`
      },
      {
        id: 'dsa-chunk-2',
        documentId: 'doc-dsa-101',
        documentTitle: 'Data Structures & Algorithms: Foundations',
        chapterTitle: 'Chapter 2: Arrays and Linked Lists Trade-offs',
        chunkIndex: 2,
        wordCount: 178,
        keywords: ['arrays', 'linked lists', 'contiguous memory', 'pointers', 'cache locality', 'insertion', 'deletion'],
        content: `Arrays store elements in contiguous memory locations. Because each element has a fixed size and elements are adjacent, random access by index is constant time O(1). However, inserting or deleting an element at an arbitrary position requires shifting adjacent elements, which costs O(n) time. Dynamic arrays (like ArrayList or JavaScript arrays) double their capacity when full, providing amortized O(1) append operations.

In contrast, Linked Lists allocate nodes individually on the heap, linking each node with a pointer (next, and optionally prev for doubly linked lists). Linked Lists require O(1) time to insert or delete at a known pointer location, but random access requires sequential traversal from the head, costing O(n) time.

A crucial real-world consideration is CPU Cache Locality: arrays exhibit excellent spatial locality because contiguous elements are loaded into L1/L2 cache lines simultaneously. Linked Lists suffer from frequent cache misses due to pointer chasing across arbitrary memory addresses.`
      },
      {
        id: 'dsa-chunk-3',
        documentId: 'doc-dsa-101',
        documentTitle: 'Data Structures & Algorithms: Foundations',
        chapterTitle: 'Chapter 3: Binary Search Trees & Balanced Trees',
        chunkIndex: 3,
        wordCount: 184,
        keywords: ['binary search tree', 'bst', 'avl tree', 'red-black tree', 'in-order traversal', 'balancing', 'log n'],
        content: `A Binary Search Tree (BST) is a hierarchical node structure where for any given node with key k:
- All keys in the left subtree are strictly less than k.
- All keys in the right subtree are strictly greater than k.

In an ideally balanced BST, operations such as search, insert, and delete take O(log n) time, proportional to the tree height h = floor(log2(n)). An in-order depth-first traversal (Left, Root, Right) yields the keys in sorted ascending order.

However, inserting sorted keys into an unaugmented BST degenerates the tree into a linked list with height h = n, degrading operations to O(n) worst-case time.

Self-balancing binary search trees solve this issue:
1. AVL Trees: Maintain strict height balancing where the heights of left and right subtrees of any node differ by at most 1. Rebalancing is performed via single or double rotations in O(1) time during insertion and deletion.
2. Red-Black Trees: Use color properties (red and black) to guarantee that no leaf is more than twice as deep as any other leaf, providing O(log n) worst-case bounds with fewer rotations on average.`
      },
      {
        id: 'dsa-chunk-4',
        documentId: 'doc-dsa-101',
        documentTitle: 'Data Structures & Algorithms: Foundations',
        chapterTitle: 'Chapter 4: Graph Traversals - BFS vs DFS',
        chunkIndex: 4,
        wordCount: 190,
        keywords: ['graphs', 'bfs', 'dfs', 'breadth-first', 'depth-first', 'queue', 'stack', 'shortest path'],
        content: `A graph G = (V, E) consists of vertices V and edges E. The two standard traversal strategies are:

Breadth-First Search (BFS):
- Explores neighbors layer by layer in concentric waves away from the starting vertex.
- Implemented using a First-In-First-Out (FIFO) Queue.
- Finds the unweighted shortest path (minimum edge count) between two vertices.
- Time complexity: O(V + E) using an adjacency list representation. Space complexity: O(V) to store the queue and visited set.

Depth-First Search (DFS):
- Explores as deeply as possible along each branch before backtracking.
- Implemented using a recursion call stack or an explicit Last-In-First-Out (LIFO) Stack.
- Well-suited for topological sorting, cycle detection in directed graphs, connected components, and pathfinding in mazes.
- Time complexity: O(V + E). Space complexity: O(V) in worst-case recursion depth.

Both algorithms must track visited vertices using a Set or boolean array to prevent infinite loops in cyclic graphs.`
      },
      {
        id: 'dsa-chunk-5',
        documentId: 'doc-dsa-101',
        documentTitle: 'Data Structures & Algorithms: Foundations',
        chapterTitle: 'Chapter 5: Dynamic Programming & Optimal Substructure',
        chunkIndex: 5,
        wordCount: 195,
        keywords: ['dynamic programming', 'memoization', 'tabulation', 'overlapping subproblems', 'optimal substructure', 'knapsack'],
        content: `Dynamic Programming (DP) is an algorithmic paradigm that solves complex problems by breaking them down into simpler overlapping subproblems. 

A problem is solvable by DP if it possesses two core properties:
1. Optimal Substructure: An optimal solution to the global problem incorporates optimal solutions to its subproblems (e.g., shortest path from A to C through B consists of shortest path A->B and B->C).
2. Overlapping Subproblems: The same subproblems are solved repeatedly in a naive recursive solution (e.g., computing fib(n-1) and fib(n-2) both recompute fib(n-3)).

There are two primary implementation patterns:
- Top-Down (Memoization): Retain the natural recursive structure, but store the result of each subproblem in a hash map or cache array before returning. If seen again, return the cached answer in O(1).
- Bottom-Up (Tabulation): Iteratively compute base cases first and build up a table until the final target state is reached. This eliminates recursion stack overhead and frequently enables space optimization (e.g., keeping only the last two states).

Classic DP problems include 0/1 Knapsack, Longest Common Subsequence (LCS), Coin Change, and Edit Distance.`
      },
      {
        id: 'dsa-chunk-6',
        documentId: 'doc-dsa-101',
        documentTitle: 'Data Structures & Algorithms: Foundations',
        chapterTitle: 'Chapter 6: Sorting Algorithms Comparison',
        chunkIndex: 6,
        wordCount: 160,
        keywords: ['sorting', 'quicksort', 'mergesort', 'heapsort', 'stability', 'pivot', 'divide and conquer'],
        content: `Comparison sorting algorithms have a theoretical lower bound of Omega(n log n).

Key sorting algorithms:
- Merge Sort: Divide and conquer. Recursively divides array into halves, sorts them, and merges in linear time. Time complexity is strictly O(n log n) in best, average, and worst cases. It is stable (preserves relative order of equal keys) but requires O(n) auxiliary memory.
- Quick Sort: Chooses a pivot element, partitions elements into less-than and greater-than partitions, and recurses. Average time is O(n log n), but worst case is O(n^2) when poor pivots are chosen (e.g., already sorted array with first element as pivot). In-place with O(log n) call stack space.
- Heap Sort: Builds a max-heap in O(n) time, repeatedly extracts the maximum root element, and restores the heap property. Runs in O(n log n) worst-case time with O(1) auxiliary space, but is not stable.`
      }
    ]
  },
  {
    document: {
      id: 'doc-bio-201',
      title: 'Cell Biology & Molecular Genetics',
      category: 'biology',
      description: 'Foundations of cellular architecture, DNA transcription, translation, and chromosome mechanics.',
      filename: 'cell_biology_textbook_ch1_4.pdf',
      uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      chunkCount: 4,
      contentSummary: 'Cellular organelles, transcription from DNA to mRNA, ribosome translation, and Mendelian inheritance.'
    },
    chunks: [
      {
        id: 'bio-chunk-1',
        documentId: 'doc-bio-201',
        documentTitle: 'Cell Biology & Molecular Genetics',
        chapterTitle: 'Chapter 1: Eukaryotic Cell Structure & Organelles',
        chunkIndex: 1,
        wordCount: 172,
        keywords: ['mitochondria', 'nucleus', 'endoplasmic reticulum', 'golgi apparatus', 'atp', 'ribosomes', 'membrane'],
        content: `Eukaryotic cells are distinguished by membrane-bound organelles that compartmentalize biochemical pathways.

Key organelles and functions:
- Nucleus: Houses the eukaryotic genome encoded in chromatin (DNA wrapped around histone proteins). Enclosed by a double membrane with nuclear pore complexes.
- Mitochondria: The energetic powerhouse of the cell. Generates ATP via oxidative phosphorylation and the Krebs cycle across its cristae (inner membrane). Contains its own circular mtDNA and replicates autonomously.
- Endoplasmic Reticulum (ER): Rough ER is studded with ribosomes for synthesizing secretable and membrane-bound proteins. Smooth ER synthesizes lipids, metabolizes carbohydrates, and sequesters calcium ions.
- Golgi Apparatus: Modifies (glycosylation), sorts, and packages proteins received from the rough ER into vesicles for transport.
- Lysosomes: Contain acidic hydrolases for degrading macromolecules and cellular debris (autophagy).`
      },
      {
        id: 'bio-chunk-2',
        documentId: 'doc-bio-201',
        documentTitle: 'Cell Biology & Molecular Genetics',
        chapterTitle: 'Chapter 2: The Central Dogma - Transcription',
        chunkIndex: 2,
        wordCount: 168,
        keywords: ['central dogma', 'transcription', 'rna polymerase', 'mrna', 'promoter', 'introns', 'exons', 'splicing'],
        content: `The Central Dogma of Molecular Biology states that genetic information flows from DNA to RNA to Protein.

Transcription is the enzymatic synthesis of RNA from a DNA template strand by RNA Polymerase. 
Process stages:
1. Initiation: RNA Polymerase binds to a specific DNA sequence called a promoter (such as the TATA box in eukaryotes) with the assistance of transcription factors.
2. Elongation: RNA Polymerase unwinds the double helix and reads the template strand in the 3' to 5' direction, synthesizing a complementary pre-mRNA transcript in the 5' to 3' direction using ribonucleotides (A, U, C, G).
3. Termination: Specific termination signals trigger the release of the nascent RNA transcript.

In eukaryotes, pre-mRNA undergoes post-transcriptional processing before nuclear export:
- 5' Capping with 7-methylguanosine.
- 3' Polyadenylation (addition of a poly-A tail).
- Splicing via the spliceosome, which excises non-coding introns and ligates coding exons together.`
      },
      {
        id: 'bio-chunk-3',
        documentId: 'doc-bio-201',
        documentTitle: 'Cell Biology & Molecular Genetics',
        chapterTitle: 'Chapter 3: Translation and Protein Synthesis',
        chunkIndex: 3,
        wordCount: 162,
        keywords: ['translation', 'trna', 'ribosome', 'anticodon', 'codons', 'peptide bond', 'start codon'],
        content: `Translation converts the nucleotide sequence of mature mRNA into a polypeptide chain at the ribosome.

The genetic code consists of triplets of nucleotides called codons. There are 64 codons:
- AUG is the universal Start Codon, coding for Methionine.
- UAA, UAG, and UGA are Stop Codons that signal termination.
The code is degenerate (redundant), meaning multiple codons can specify the same amino acid.

Transfer RNA (tRNA) molecules act as physical adaptors. Each tRNA features:
- An anticodon loop complementary to a specific mRNA codon.
- An amino acid attachment site charged by aminoacyl-tRNA synthetase.

The ribosome consists of small and large subunits with three functional sites:
- A (Aminoacyl) site: Binds incoming charged tRNA.
- P (Peptidyl) site: Holds the tRNA carrying the growing polypeptide chain; catalyzes peptide bond formation.
- E (Exit) site: Discharges uncharged tRNA.`
      },
      {
        id: 'bio-chunk-4',
        documentId: 'doc-bio-201',
        documentTitle: 'Cell Biology & Molecular Genetics',
        chapterTitle: 'Chapter 4: Mendelian Genetics & Chromosomal Inheritance',
        chunkIndex: 4,
        wordCount: 155,
        keywords: ['mendel', 'alleles', 'segregation', 'independent assortment', 'phenotype', 'genotype', 'punnett square'],
        content: `Gregor Mendel established the fundamental principles of heredity through systematic pea plant experiments:

1. Law of Segregation: Every individual possesses two alleles for each gene. During gametogenesis (meiosis), these alleles segregate so that each gamete carries only one allele.
2. Law of Independent Assortment: Genes for different traits segregate independently during gamete formation, provided they reside on different chromosomes or are far apart on the same chromosome (unlinked).
3. Principle of Dominance: An organism with at least one dominant allele will express the dominant phenotype; the recessive allele is only expressed when homozygous (aa).

Deviations from standard Mendelian ratios include incomplete dominance (blended phenotype, e.g., pink snapdragons), codominance (both alleles simultaneously visible, e.g., AB blood type), and sex-linked inheritance (genes situated on X or Y chromosomes, e.g., hemophilia).`
      }
    ]
  },
  {
    document: {
      id: 'doc-ml-301',
      title: 'Machine Learning & Deep Learning Core',
      category: 'machine_learning',
      description: 'Introduction to supervised learning, optimization, regularization, neural networks, and model evaluation.',
      filename: 'ml_deep_learning_lecture_notes.pdf',
      uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      chunkCount: 4,
      contentSummary: 'Supervised vs unsupervised learning, gradient descent, overfitting remedies, and artificial neural networks.'
    },
    chunks: [
      {
        id: 'ml-chunk-1',
        documentId: 'doc-ml-301',
        documentTitle: 'Machine Learning & Deep Learning Core',
        chapterTitle: 'Chapter 1: Supervised Learning Paradigms & Cost Functions',
        chunkIndex: 1,
        wordCount: 180,
        keywords: ['supervised learning', 'regression', 'classification', 'loss function', 'mean squared error', 'cross-entropy'],
        content: `In supervised machine learning, the algorithm learns a mapping function f: X -> Y from labeled training data pairs {(x_i, y_i)}.

The two primary tasks are:
1. Regression: Predicting continuous numerical values (e.g., house prices, stock values). A standard loss metric is Mean Squared Error (MSE):
   L = (1/N) * sum((y_i - y_hat_i)^2).
2. Classification: Predicting discrete category labels (e.g., spam vs non-spam, disease diagnosis). Binary classification uses Binary Cross-Entropy (Log Loss):
   L = -(1/N) * sum(y_i * log(p_i) + (1 - y_i) * log(1 - p_i)), where p_i is the predicted probability from a Sigmoid activation function.

For multiclass classification, the Softmax activation function normalizes raw logits into a probability distribution summing to 1, evaluated via Categorical Cross-Entropy Loss.`
      },
      {
        id: 'ml-chunk-2',
        documentId: 'doc-ml-301',
        documentTitle: 'Machine Learning & Deep Learning Core',
        chapterTitle: 'Chapter 2: Optimization via Gradient Descent',
        chunkIndex: 2,
        wordCount: 168,
        keywords: ['gradient descent', 'learning rate', 'stochastic gradient descent', 'adam optimizer', 'backpropagation'],
        content: `Gradient Descent iteratively adjusts model weights theta in the direction of steepest descent of the loss function J(theta).
Update rule: theta = theta - alpha * grad(J(theta)), where alpha is the learning rate.

Variants:
- Batch Gradient Descent: Computes the gradient using all training examples. Stable convergence but computationally prohibitive on massive datasets.
- Stochastic Gradient Descent (SGD): Computes the gradient and updates weights for a single random sample per step. Highly noisy trajectory that can escape local minima, but slow to settle.
- Mini-batch SGD: Computes gradients over small subsets (batch sizes of 32, 64, or 128). Strikes the optimal balance of vectorization efficiency and gradient stability.

Modern adaptive optimizers like Adam (Adaptive Moment Estimation) compute adaptive learning rates for each parameter by maintaining exponentially decaying averages of past gradients (first moment) and past squared gradients (second moment).`
      },
      {
        id: 'ml-chunk-3',
        documentId: 'doc-ml-301',
        documentTitle: 'Machine Learning & Deep Learning Core',
        chapterTitle: 'Chapter 3: Overfitting, Underfitting, and Regularization',
        chunkIndex: 3,
        wordCount: 175,
        keywords: ['bias-variance tradeoff', 'overfitting', 'regularization', 'l1 lasso', 'l2 ridge', 'dropout'],
        content: `The Bias-Variance Tradeoff is central to machine learning:
- High Bias (Underfitting): The model is too simple to capture underlying patterns, performing poorly on both training and test data.
- High Variance (Overfitting): The model memorizes training noise and idiosyncrasies, achieving near-zero training error but failing to generalize to unseen test data.

Regularization techniques combat overfitting:
1. L2 Regularization (Ridge / Weight Decay): Adds a penalty proportional to the sum of squared weights: lambda * sum(w_j^2). Encourages small, diffuse weights across all features.
2. L1 Regularization (Lasso): Adds a penalty proportional to the absolute values: lambda * sum(|w_j|). Drives less informative weights strictly to zero, effectively performing automatic feature selection.
3. Dropout: During training of neural networks, randomly deactivates a fraction p of neurons with every forward pass. Prevents neurons from co-adapting and forces the network to learn redundant, robust representations.`
      },
      {
        id: 'ml-chunk-4',
        documentId: 'doc-ml-301',
        documentTitle: 'Machine Learning & Deep Learning Core',
        chapterTitle: 'Chapter 4: Neural Networks and Backpropagation',
        chunkIndex: 4,
        wordCount: 185,
        keywords: ['neural network', 'perceptron', 'backpropagation', 'chain rule', 'activation functions', 'relu'],
        content: `An Artificial Neural Network consists of interconnected layers of artificial neurons. Each neuron calculates a weighted sum of its inputs plus a bias term z = w^T * x + b, followed by a non-linear activation function a = sigma(z).

Without non-linear activations, stacking multiple linear layers would mathematically collapse into a single linear transformation, unable to learn complex non-linear decision boundaries. Popular activation functions include:
- ReLU (Rectified Linear Unit): f(x) = max(0, x). Computationally inexpensive and mitigates the vanishing gradient problem, though vulnerable to "dying ReLU" if neurons become perpetually inactive.
- Leaky ReLU / GELU: Allows small gradient flow for negative inputs.
- Sigmoid & Tanh: Smooth S-curves, but saturate at extreme values causing vanishing gradients.

Backpropagation applies the calculus Chain Rule backwards from the loss output through all hidden layers to calculate the partial derivative of the loss with respect to every weight (dLoss/dw). These gradients guide the optimizer during weight updates.`
      }
    ]
  }
];
