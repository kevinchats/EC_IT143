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

**********************************************************************************/
--------------------------------------------------------------
-- Question 1: What is the total spending by category in Planet Express transactions?
--------------------------------------------------------------
SELECT
    Category,
    SUM(Amount) AS Total_Spending
FROM Planet_Express
GROUP BY Category
ORDER BY Total_Spending DESC;


--------------------------------------------------------------
-- Question 2: Which card members have the highest total spending in Planet Express?
--------------------------------------------------------------
SELECT
    Card_Member,
    SUM(Amount) AS Total_Spending
FROM Planet_Express
GROUP BY Card_Member
ORDER BY Total_Spending DESC;


--------------------------------------------------------------
-- Question 3: How many active employees are there in each department?
--------------------------------------------------------------
SELECT
    Department,
    COUNT(*) AS Active_Employees
FROM Family_Data
WHERE Status = 'Active'
GROUP BY Department
ORDER BY Active_Employees DESC;


--------------------------------------------------------------
-- Question 4: What are the top 5 members with the highest net credit balance in FBS_Viza_Costmo?
--------------------------------------------------------------
SELECT TOP 5
    Member_Name,
    SUM(Credit - Debit) AS Net_Balance
FROM FBS_Viza_Costmo
GROUP BY Member_Name
ORDER BY Net_Balance DESC;
