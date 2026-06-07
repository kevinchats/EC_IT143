--Q1:
--step 1:
select db.*
	from DatabaseLog as db
where Event = 'CREATE_INDEX';

--estimated subtree cost:0.579112
--apply missing index

--step 2:
USE [AdventureWorks2022]
GO
CREATE NONCLUSTERED INDEX [IX_Events]
ON [dbo].[DatabaseLog] ([Event])
INCLUDE ([DatabaseLogID],[PostTime],[DatabaseUser],[Schema],[Object],[TSQL],[XmlEvent])
GO


--new estimated subtree cost:0.0283071
--no more suggested index recommendation


--Q2:
--step 1=
select pp.*
	from Person.Person as pp
where MiddleName = 'E';

--estimated subtree cost:0.119553
--apply missing index

--step 2:
USE [AdventureWorks2022]
GO
CREATE NONCLUSTERED INDEX [IX_FirstName]
ON [Person].[Person] ([FirstName])