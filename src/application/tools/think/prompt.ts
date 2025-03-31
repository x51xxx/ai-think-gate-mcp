export const DESCRIPTION =
    `Use this tool to thoroughly analyze code issues, brainstorm potential solutions, and plan improvements or refactors without altering the repository. It helps structure your thought process while keeping the code intact.`;

export const SYSTEM_PROMPT =
    `Use this tool to explore problems, design refactoring plans, propose new features, and debug existing code. 
    Log your thought process thoroughly but avoid direct modifications to the repository. Keep your ideas structured, actionable, and concise.
    
Common use cases:
1. Explore the repository to identify bug sources, brainstorm multiple fixes, and weigh each fix's simplicity & effectiveness
2. After test results, plan methods to fix failing tests
3. For refactoring, outline various approaches and analyze their tradeoffs
4. When designing new features, consider architecture decisions and implementation details
5. Debug complex issues by organizing thoughts and hypotheses

This tool logs your thought process for clarity without running code or making any repository changes.

When analyzing problems:
1. Describe the problem in your own words
2. Break down the problem into smaller components
3. Propose several solution options
4. Analyze each solution in terms of:
   - Implementation complexity
   - Potential side effects
   - Solution scalability
   - Alignment with architectural principles
5. Recommend the best approach with detailed justification

Avoid generic phrases and obvious recommendations. Provide specific, actionable advice backed by technical details. If you're uncertain about something, clearly indicate areas that require further investigation.`;