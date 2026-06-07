/*****************************************************************************************************************
NAME:    3.4 Adventure Works
PURPOSE: Answer Questions

MODIFICATION LOG:
Ver      Date        Author        Description
-----   ----------   -----------   -------------------------------------------------------------------------------
1.0     30/09/2025   KChatira       1. Built this script for EC IT 143


RUNTIME: 
Xm Xs

NOTES: 
This is where I talk about what this script is, why I built it, and other stuff...
 
******************************************************************************************************************/

-- Q1: What is the list price of the ten cheapest products in AdventureWorks 2022?
-- A1:

SELECT TOP 10
    Name AS ProductName,
    ListPrice
FROM Production.Product
WHERE ListPrice > 0
ORDER BY ListPrice ASC;

-- Q2: What are the top ten most expensive products by list price in the Production.Product table?
-- A2:

SELECT TOP 10
    Name AS ProductName,
    ListPrice
FROM Production.Product
ORDER BY ListPrice DESC;



-- Q3: How many orders did each sales territory process in 2022?
-- A3:

SELECT
    t.Name AS TerritoryName,
    COUNT(soh.SalesOrderID) AS OrderCount
FROM Sales.SalesOrderHeader soh
JOIN Sales.SalesTerritory t
    ON soh.TerritoryID = t.TerritoryID
WHERE YEAR(soh.OrderDate) = 2022
GROUP BY t.Name
ORDER BY OrderCount DESC;



-- Q4: Which salespersons generated the most revenue for mountain bikes in 2022? Show name and total revenue.
-- A4:

SELECT
    p.FirstName + ' ' + p.LastName AS SalesPersonName,
    SUM(sod.LineTotal) AS TotalRevenue
FROM Sales.SalesOrderDetail sod
JOIN Sales.SalesOrderHeader soh
    ON sod.SalesOrderID = soh.SalesOrderID
JOIN Sales.SalesPerson sp
    ON soh.SalesPersonID = sp.BusinessEntityID
JOIN Person.Person p
    ON sp.BusinessEntityID = p.BusinessEntityID
JOIN Production.Product pr
    ON sod.ProductID = pr.ProductID
JOIN Production.ProductSubcategory sub
    ON pr.ProductSubcategoryID = sub.ProductSubcategoryID
JOIN Production.ProductCategory cat
    ON sub.ProductCategoryID = cat.ProductCategoryID
WHERE cat.Name = 'Bikes'
  AND pr.Name LIKE '%Mountain%'
  AND YEAR(soh.OrderDate) = 2022
GROUP BY p.FirstName, p.LastName



-- Q5: I want to analyze bike orders in Q1 2022. For each bike model, show quantity sold, list price, standard cost, and estimated net revenue by month.
-- A5:

SELECT
    pr.Name AS BikeModel,
    MONTH(soh.OrderDate) AS OrderMonth,
    SUM(sod.OrderQty) AS QuantitySold,
    pr.ListPrice,
    pr.StandardCost,
    SUM(sod.LineTotal) AS NetRevenue
FROM Sales.SalesOrderDetail sod
JOIN Sales.SalesOrderHeader soh
    ON sod.SalesOrderID = soh.SalesOrderID
JOIN Production.Product pr
    ON sod.ProductID = pr.ProductID
JOIN Production.ProductSubcategory sub
    ON pr.ProductSubcategoryID = sub.ProductSubcategoryID
JOIN Production.ProductCategory cat
    ON sub.ProductCategoryID = cat.ProductCategoryID
WHERE cat.Name = 'Bikes'
  AND YEAR(soh.OrderDate) = 2022
  AND MONTH(soh.OrderDate) BETWEEN 1 AND 3
GROUP BY pr.Name, MONTH(soh.OrderDate), pr.ListPrice, pr.StandardCost
ORDER BY OrderMonth, BikeModel;


-- Q6: What are the top ten most expensive products by list price in the Production.Product table?
-- A6:

SELECT
    sm.Name AS ShipMethod,
    COUNT(soh.SalesOrderID) AS OrderCount,
    AVG(DATEDIFF(DAY, soh.OrderDate, soh.ShipDate)) AS AvgDaysToShip
FROM Sales.SalesOrderHeader soh
JOIN Purchasing.ShipMethod sm
    ON soh.ShipMethodID = sm.ShipMethodID
WHERE YEAR(soh.OrderDate) = 2012
  AND MONTH(soh.OrderDate) BETWEEN 10 AND 12
GROUP BY sm.Name
ORDER BY AvgDaysToShip ASC;



-- Q7: What are the top ten most expensive products by list price in the Production.Product table?
-- A7:

SELECT TABLE_SCHEMA, TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_SCHEMA, TABLE_NAME;





-- Q8: What are the top ten most expensive products by list price in the Production.Product table?
-- A8:

SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME = 'BusinessEntityID'
ORDER BY TABLE_SCHEMA, TABLE_NAME;








