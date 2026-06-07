NAME:    5.2 - My Communities Analysis
PURPOSE: Answer-Create Answers

MODIFICATION LOG:
Ver      Date        Author        Description
-----   ----------   -----------   -------------------------------------------------------------------------------
1.0     14/10/2025   KChatira       1. Built this script for EC IT 143


RUNTIME:
Xm Xs

NOTES:
This is where I talk about what this script is, why I built it, and other stuff...

******************************************************************************************************************/




-- Q1: Top 3 Highest Paid Positions
SELECT TOP 3
    p.position_name,
    SUM(f.mtd_salary) AS total_salary
FROM tblPlayerFact AS f
JOIN tblPlayerDim AS d ON f.pl_id = d.pl_id
JOIN PositionDim AS p ON d.position_id = p.position_id
GROUP BY p.position_name
ORDER BY total_salary DESC;


-- Q2: Player Positions and Tournament Codes
SELECT
    d.f_name,
    d.l_name,
    p.position_name,
    t.tournament_code
FROM tblPlayerDim AS d
JOIN PositionDim AS p ON d.position_id = p.position_id
JOIN TeamDim AS t ON d.team_id = t.team_id;


-- Q3: Count of Players per Position
SELECT
    p.position_name,
    COUNT(d.pl_id) AS num_players
FROM tblPlayerDim AS d
JOIN PositionDim AS p ON d.position_id = p.position_id
GROUP BY p.position_name
ORDER BY num_players DESC;


-- Q4: Average Salary per Position
SELECT
    p.position_name,
    AVG(f.mtd_salary) AS avg_salary
FROM tblPlayerFact AS f
JOIN tblPlayerDim AS d ON f.pl_id = d.pl_id
JOIN PositionDim AS p ON d.position_id = p.position_id
GROUP BY p.position_name
ORDER BY avg_salary DESC;


