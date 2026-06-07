USE [EC_IT143_DA]
GO

/****** Object:  View [dbo].[v_w3_schools_customers]    Script Date: 5/10/2022 1:55:47 PM ******/
DROP VIEW [dbo].[v_w3_schools_customers]
GO

/****** Object:  View [dbo].[v_w3_schools_customers]    Script Date: 5/10/2022 1:55:47 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CrEATE VIEW [dbo].[v_w3_schools_customers]
as 
/*****************************************************************************************************************
NAME:    dbo.v_w3_schools_customers
PURPOSE: W3 Schools - Customers

MODIFICATION LOG:
Ver      Date        Author        Description
-----   ----------   -----------   -------------------------------------------------------------------------------
1.0     05/10/2022   JJAUSSI       1. Built this view for EC IT143


RUNTIME: 
1s

NOTES: 
Replicates the Customers data set found here...
https://www.w3schools.com/sql/trysql.asp?filename=trysql_select_all
 
******************************************************************************************************************/

WITH s1
as
(
SELECT 1 as CustomerID
, 'Alfreds Futterkiste' as CustomerName
, 'Maria Anders' as ContactName
, 'Obere Str. 57' as Address
, 'Berlin' as City
, '12209' as Country
UNION 
SELECT 2 as CustomerID
, 'Ana Trujillo Emparedados y helados' as CustomerName
, 'Ana Trujillo' as ContactName
, 'Avda. de la Constitución 2222' as Address
, 'México D.F.' as City
, '5021' as Country
UNION 
SELECT 3 as CustomerID
, 'Antonio Moreno Taquería' as CustomerName
, 'Antonio Moreno' as ContactName
, 'Mataderos 2312' as Address
, 'México D.F.' as City
, '5023' as Country
UNION 
SELECT 4 as CustomerID
, 'Around the Horn' as CustomerName
, 'Thomas Hardy' as ContactName
, '120 Hanover Sq.' as Address
, 'London' as City
, 'WA1 1DP' as Country
UNION 
SELECT 5 as CustomerID
, 'Berglunds snabbköp' as CustomerName
, 'Christina Berglund' as ContactName
, 'Berguvsvägen 8' as Address
, 'Luleå' as City
, 'S-958 22' as Country
UNION 
SELECT 6 as CustomerID
, 'Blauer See Delikatessen' as CustomerName
, 'Hanna Moos' as ContactName
, 'Forsterstr. 57' as Address
, 'Mannheim' as City
, '68306' as Country
UNION 
SELECT 7 as CustomerID
, 'Blondel père et fils' as CustomerName
, 'Frédérique Citeaux' as ContactName
, '24, place Kléber' as Address
, 'Strasbourg' as City
, '67000' as Country
UNION 
SELECT 8 as CustomerID
, 'Bólido Comidas preparadas' as CustomerName
, 'Martín Sommer' as ContactName
, 'C/ Araquil, 67' as Address
, 'Madrid' as City
, '28023' as Country
UNION 
SELECT 9 as CustomerID
, 'Bon app''' as CustomerName
, 'Laurence Lebihans' as ContactName
, '12, rue des Bouchers' as Address
, 'Marseille' as City
, '13008' as Country
UNION 
SELECT 10 as CustomerID
, 'Bottom-Dollar Marketse' as CustomerName
, 'Elizabeth Lincoln' as ContactName
, '23 Tsawassen Blvd.' as Address
, 'Tsawassen' as City
, 'T2F 8M4' as Country
UNION 
SELECT 11 as CustomerID
, 'B''s Beverages' as CustomerName
, 'Victoria Ashworth' as ContactName
, 'Fauntleroy Circus' as Address
, 'London' as City
, 'EC2 5NT' as Country
UNION 
SELECT 12 as CustomerID
, 'Cactus Comidas para llevar' as CustomerName
, 'Patricio Simpson' as ContactName
, 'Cerrito 333' as Address
, 'Buenos Aires' as City
, '1010' as Country
UNION 
SELECT 13 as CustomerID
, 'Centro comercial Moctezuma' as CustomerName
, 'Francisco Chang' as ContactName
, 'Sierras de Granada 9993' as Address
, 'México D.F.' as City
, '5022' as Country
UNION 
SELECT 14 as CustomerID
, 'Chop-suey Chinese' as CustomerName
, 'Yang Wang' as ContactName
, 'Hauptstr. 29' as Address
, 'Bern' as City
, '3012' as Country
UNION 
SELECT 15 as CustomerID
, 'Comércio Mineiro' as CustomerName
, 'Pedro Afonso' as ContactName
, 'Av. dos Lusíadas, 23' as Address
, 'São Paulo' as City
, '05432-043' as Country
UNION 
SELECT 16 as CustomerID
, 'Consolidated Holdings' as CustomerName
, 'Elizabeth Brown' as ContactName
, 'Berkeley Gardens 12 Brewery' as Address
, 'London' as City
, 'WX1 6LT' as Country
UNION 
SELECT 17 as CustomerID
, 'Drachenblut Delikatessend' as CustomerName
, 'Sven Ottlieb' as ContactName
, 'Walserweg 21' as Address
, 'Aachen' as City
, '52066' as Country
UNION 
SELECT 18 as CustomerID
, 'Du monde entier' as CustomerName
, 'Janine Labrune' as ContactName
, '67, rue des Cinquante Otages' as Address
, 'Nantes' as City
, '44000' as Country
UNION 
SELECT 19 as CustomerID
, 'Eastern Connection' as CustomerName
, 'Ann Devon' as ContactName
, '35 King George' as Address
, 'London' as City
, 'WX3 6FW' as Country
UNION 
SELECT 20 as CustomerID
, 'Ernst Handel' as CustomerName
, 'Roland Mendel' as ContactName
, 'Kirchgasse 6' as Address
, 'Graz' as City
, '8010' as Country
UNION 
SELECT 21 as CustomerID
, 'Familia Arquibaldo' as CustomerName
, 'Aria Cruz' as ContactName
, 'Rua Orós, 92' as Address
, 'São Paulo' as City
, '05442-030' as Country
UNION 
SELECT 22 as CustomerID
, 'FISSA Fabrica Inter. Salchichas S.A.' as CustomerName
, 'Diego Roel' as ContactName
, 'C/ Moralzarzal, 86' as Address
, 'Madrid' as City
, '28034' as Country
UNION 
SELECT 23 as CustomerID
, 'Folies gourmandes' as CustomerName
, 'Martine Rancé' as ContactName
, '184, chaussée de Tournai' as Address
, 'Lille' as City
, '59000' as Country
UNION 
SELECT 24 as CustomerID
, 'Folk och fä HB' as CustomerName
, 'Maria Larsson' as ContactName
, 'Åkergatan 24' as Address
, 'Bräcke' as City
, 'S-844 67' as Country
UNION 
SELECT 25 as CustomerID
, 'Frankenversand' as CustomerName
, 'Peter Franken' as ContactName
, 'Berliner Platz 43' as Address
, 'München' as City
, '80805' as Country
UNION 
SELECT 26 as CustomerID
, 'France restauration' as CustomerName
, 'Carine Schmitt' as ContactName
, '54, rue Royale' as Address
, 'Nantes' as City
, '44000' as Country
UNION 
SELECT 27 as CustomerID
, 'Franchi S.p.A.' as CustomerName
, 'Paolo Accorti' as ContactName
, 'Via Monte Bianco 34' as Address
, 'Torino' as City
, '10100' as Country
UNION 
SELECT 28 as CustomerID
, 'Furia Bacalhau e Frutos do Mar' as CustomerName
, 'Lino Rodriguez' as ContactName
, 'Jardim das rosas n. 32' as Address
, 'Lisboa' as City
, '1675' as Country
UNION 
SELECT 29 as CustomerID
, 'Galería del gastrónomo' as CustomerName
, 'Eduardo Saavedra' as ContactName
, 'Rambla de Cataluña, 23' as Address
, 'Barcelona' as City
, '8022' as Country
UNION 
SELECT 30 as CustomerID
, 'Godos Cocina Típica' as CustomerName
, 'José Pedro Freyre' as ContactName
, 'C/ Romero, 33' as Address
, 'Sevilla' as City
, '41101' as Country
UNION 
SELECT 31 as CustomerID
, 'Gourmet Lanchonetes' as CustomerName
, 'André Fonseca' as ContactName
, 'Av. Brasil, 442' as Address
, 'Campinas' as City
, '04876-786' as Country
UNION 
SELECT 32 as CustomerID
, 'Great Lakes Food Market' as CustomerName
, 'Howard Snyder' as ContactName
, '2732 Baker Blvd.' as Address
, 'Eugene' as City
, '97403' as Country
UNION 
SELECT 33 as CustomerID
, 'GROSELLA-Restaurante' as CustomerName
, 'Manuel Pereira' as ContactName
, '5ª Ave. Los Palos Grandes' as Address
, 'Caracas' as City
, '1081' as Country
UNION 
SELECT 34 as CustomerID
, 'Hanari Carnes' as CustomerName
, 'Mario Pontes' as ContactName
, 'Rua do Paço, 67' as Address
, 'Rio de Janeiro' as City
, '05454-876' as Country
UNION 
SELECT 35 as CustomerID
, 'HILARIÓN-Abastos' as CustomerName
, 'Carlos Hernández' as ContactName
, 'Carrera 22 con Ave. Carlos Soublette #8-35' as Address
, 'San Cristóbal' as City
, '5022' as Country
UNION 
SELECT 36 as CustomerID
, 'Hungry Coyote Import Store' as CustomerName
, 'Yoshi Latimer' as ContactName
, 'City Center Plaza 516 Main St.' as Address
, 'Elgin' as City
, '97827' as Country
UNION 
SELECT 37 as CustomerID
, 'Hungry Owl All-Night Grocers' as CustomerName
, 'Patricia McKenna' as ContactName
, '8 Johnstown Road' as Address
, 'Cork' as City
, '' as Country
UNION 
SELECT 38 as CustomerID
, 'Island Trading' as CustomerName
, 'Helen Bennett' as ContactName
, 'Garden House Crowther Way' as Address
, 'Cowes' as City
, 'PO31 7PJ' as Country
UNION 
SELECT 39 as CustomerID
, 'Königlich Essen' as CustomerName
, 'Philip Cramer' as ContactName
, 'Maubelstr. 90' as Address
, 'Brandenburg' as City
, '14776' as Country
UNION 
SELECT 40 as CustomerID
, 'La corne d''abondance' as CustomerName
, 'Daniel Tonini' as ContactName
, '67, avenue de l''Europe' as Address
, 'Versailles' as City
, '78000' as Country
UNION 
SELECT 41 as CustomerID
, 'La maison d''Asie' as CustomerName
, 'Annette Roulet' as ContactName
, '1 rue Alsace-Lorraine' as Address
, 'Toulouse' as City
, '31000' as Country
UNION 
SELECT 42 as CustomerID
, 'Laughing Bacchus Wine Cellars' as CustomerName
, 'Yoshi Tannamuri' as ContactName
, '1900 Oak St.' as Address
, 'Vancouver' as City
, 'V3F 2K1' as Country
UNION 
SELECT 43 as CustomerID
, 'Lazy K Kountry Store' as CustomerName
, 'John Steel' as ContactName
, '12 Orchestra Terrace' as Address
, 'Walla Walla' as City
, '99362' as Country
UNION 
SELECT 44 as CustomerID
, 'Lehmanns Marktstand' as CustomerName
, 'Renate Messner' as ContactName
, 'Magazinweg 7' as Address
, 'Frankfurt a.M.' as City
, '60528' as Country
UNION 
SELECT 45 as CustomerID
, 'Let''s Stop N Shop' as CustomerName
, 'Jaime Yorres' as ContactName
, '87 Polk St. Suite 5' as Address
, 'San Francisco' as City
, '94117' as Country
UNION 
SELECT 46 as CustomerID
, 'LILA-Supermercado' as CustomerName
, 'Carlos González' as ContactName
, 'Carrera 52 con Ave. Bolívar #65-98 Llano Largo' as Address
, 'Barquisimeto' as City
, '3508' as Country
UNION 
SELECT 47 as CustomerID
, 'LINO-Delicateses' as CustomerName
, 'Felipe Izquierdo' as ContactName
, 'Ave. 5 de Mayo Porlamar' as Address
, 'I. de Margarita' as City
, '4980' as Country
UNION 
SELECT 48 as CustomerID
, 'Lonesome Pine Restaurant' as CustomerName
, 'Fran Wilson' as ContactName
, '89 Chiaroscuro Rd.' as Address
, 'Portland' as City
, '97219' as Country
UNION 
SELECT 49 as CustomerID
, 'Magazzini Alimentari Riuniti' as CustomerName
, 'Giovanni Rovelli' as ContactName
, 'Via Ludovico il Moro 22' as Address
, 'Bergamo' as City
, '24100' as Country
UNION 
SELECT 50 as CustomerID
, 'Maison Dewey' as CustomerName
, 'Catherine Dewey' as ContactName
, 'Rue Joseph-Bens 532' as Address
, 'Bruxelles' as City
, 'B-1180' as Country
UNION 
SELECT 51 as CustomerID
, 'Mère Paillarde' as CustomerName
, 'Jean Fresnière' as ContactName
, '43 rue St. Laurent' as Address
, 'Montréal' as City
, 'H1J 1C3' as Country
UNION 
SELECT 52 as CustomerID
, 'Morgenstern Gesundkost' as CustomerName
, 'Alexander Feuer' as ContactName
, 'Heerstr. 22' as Address
, 'Leipzig' as City
, '4179' as Country
UNION 
SELECT 53 as CustomerID
, 'North/South' as CustomerName
, 'Simon Crowther' as ContactName
, 'South House 300 Queensbridge' as Address
, 'London' as City
, 'SW7 1RZ' as Country
UNION 
SELECT 54 as CustomerID
, 'Océano Atlántico Ltda.' as CustomerName
, 'Yvonne Moncada' as ContactName
, 'Ing. Gustavo Moncada 8585 Piso 20-A' as Address
, 'Buenos Aires' as City
, '1010' as Country
UNION 
SELECT 55 as CustomerID
, 'Old World Delicatessen' as CustomerName
, 'Rene Phillips' as ContactName
, '2743 Bering St.' as Address
, 'Anchorage' as City
, '99508' as Country
UNION 
SELECT 56 as CustomerID
, 'Ottilies Käseladen' as CustomerName
, 'Henriette Pfalzheim' as ContactName
, 'Mehrheimerstr. 369' as Address
, 'Köln' as City
, '50739' as Country
UNION 
SELECT 57 as CustomerID
, 'Paris spécialités' as CustomerName
, 'Marie Bertrand' as ContactName
, '265, boulevard Charonne' as Address
, 'Paris' as City
, '75012' as Country
UNION 
SELECT 58 as CustomerID
, 'Pericles Comidas clásicas' as CustomerName
, 'Guillermo Fernández' as ContactName
, 'Calle Dr. Jorge Cash 321' as Address
, 'México D.F.' as City
, '5033' as Country
UNION 
SELECT 59 as CustomerID
, 'Piccolo und mehr' as CustomerName
, 'Georg Pipps' as ContactName
, 'Geislweg 14' as Address
, 'Salzburg' as City
, '5020' as Country
UNION 
SELECT 60 as CustomerID
, 'Princesa Isabel Vinhoss' as CustomerName
, 'Isabel de Castro' as ContactName
, 'Estrada da saúde n. 58' as Address
, 'Lisboa' as City
, '1756' as Country
UNION 
SELECT 61 as CustomerID
, 'Que Delícia' as CustomerName
, 'Bernardo Batista' as ContactName
, 'Rua da Panificadora, 12' as Address
, 'Rio de Janeiro' as City
, '02389-673' as Country
UNION 
SELECT 62 as CustomerID
, 'Queen Cozinha' as CustomerName
, 'Lúcia Carvalho' as ContactName
, 'Alameda dos Canàrios, 891' as Address
, 'São Paulo' as City
, '05487-020' as Country
UNION 
SELECT 63 as CustomerID
, 'QUICK-Stop' as CustomerName
, 'Horst Kloss' as ContactName
, 'Taucherstraße 10' as Address
, 'Cunewalde' as City
, '1307' as Country
UNION 
SELECT 64 as CustomerID
, 'Rancho grande' as CustomerName
, 'Sergio Gutiérrez' as ContactName
, 'Av. del Libertador 900' as Address
, 'Buenos Aires' as City
, '1010' as Country
UNION 
SELECT 65 as CustomerID
, 'Rattlesnake Canyon Grocery' as CustomerName
, 'Paula Wilson' as ContactName
, '2817 Milton Dr.' as Address
, 'Albuquerque' as City
, '87110' as Country
UNION 
SELECT 66 as CustomerID
, 'Reggiani Caseifici' as CustomerName
, 'Maurizio Moroni' as ContactName
, 'Strada Provinciale 124' as Address
, 'Reggio Emilia' as City
, '42100' as Country
UNION 
SELECT 67 as CustomerID
, 'Ricardo Adocicados' as CustomerName
, 'Janete Limeira' as ContactName
, 'Av. Copacabana, 267' as Address
, 'Rio de Janeiro' as City
, '02389-890' as Country
UNION 
SELECT 68 as CustomerID
, 'Richter Supermarkt' as CustomerName
, 'Michael Holz' as ContactName
, 'Grenzacherweg 237' as Address
, 'Genève' as City
, '1203' as Country
UNION 
SELECT 69 as CustomerID
, 'Romero y tomillo' as CustomerName
, 'Alejandra Camino' as ContactName
, 'Gran Vía, 1' as Address
, 'Madrid' as City
, '28001' as Country
UNION 
SELECT 70 as CustomerID
, 'Santé Gourmet' as CustomerName
, 'Jonas Bergulfsen' as ContactName
, 'Erling Skakkes gate 78' as Address
, 'Stavern' as City
, '4110' as Country
UNION 
SELECT 71 as CustomerID
, 'Save-a-lot Markets' as CustomerName
, 'Jose Pavarotti' as ContactName
, '187 Suffolk Ln.' as Address
, 'Boise' as City
, '83720' as Country
UNION 
SELECT 72 as CustomerID
, 'Seven Seas Imports' as CustomerName
, 'Hari Kumar' as ContactName
, '90 Wadhurst Rd.' as Address
, 'London' as City
, 'OX15 4NB' as Country
UNION 
SELECT 73 as CustomerID
, 'Simons bistro' as CustomerName
, 'Jytte Petersen' as ContactName
, 'Vinbæltet 34' as Address
, 'København' as City
, '1734' as Country
UNION 
SELECT 74 as CustomerID
, 'Spécialités du monde' as CustomerName
, 'Dominique Perrier' as ContactName
, '25, rue Lauriston' as Address
, 'Paris' as City
, '75016' as Country
UNION 
SELECT 75 as CustomerID
, 'Split Rail Beer & Ale' as CustomerName
, 'Art Braunschweiger' as ContactName
, 'P.O. Box 555' as Address
, 'Lander' as City
, '82520' as Country
UNION 
SELECT 76 as CustomerID
, 'Suprêmes délices' as CustomerName
, 'Pascale Cartrain' as ContactName
, 'Boulevard Tirou, 255' as Address
, 'Charleroi' as City
, 'B-6000' as Country
UNION 
SELECT 77 as CustomerID
, 'The Big Cheese' as CustomerName
, 'Liz Nixon' as ContactName
, '89 Jefferson Way Suite 2' as Address
, 'Portland' as City
, '97201' as Country
UNION 
SELECT 78 as CustomerID
, 'The Cracker Box' as CustomerName
, 'Liu Wong' as ContactName
, '55 Grizzly Peak Rd.' as Address
, 'Butte' as City
, '59801' as Country
UNION 
SELECT 79 as CustomerID
, 'Toms Spezialitäten' as CustomerName
, 'Karin Josephs' as ContactName
, 'Luisenstr. 48' as Address
, 'Münster' as City
, '44087' as Country
UNION 
SELECT 80 as CustomerID
, 'Tortuga Restaurante' as CustomerName
, 'Miguel Angel Paolino' as ContactName
, 'Avda. Azteca 123' as Address
, 'México D.F.' as City
, '5033' as Country
UNION 
SELECT 81 as CustomerID
, 'Tradição Hipermercados' as CustomerName
, 'Anabela Domingues' as ContactName
, 'Av. Inês de Castro, 414' as Address
, 'São Paulo' as City
, '05634-030' as Country
UNION 
SELECT 82 as CustomerID
, 'Trail''s Head Gourmet Provisioners' as CustomerName
, 'Helvetius Nagy' as ContactName
, '722 DaVinci Blvd.' as Address
, 'Kirkland' as City
, '98034' as Country
UNION 
SELECT 83 as CustomerID
, 'Vaffeljernet' as CustomerName
, 'Palle Ibsen' as ContactName
, 'Smagsløget 45' as Address
, 'Århus' as City
, '8200' as Country
UNION 
SELECT 84 as CustomerID
, 'Victuailles en stock' as CustomerName
, 'Mary Saveley' as ContactName
, '2, rue du Commerce' as Address
, 'Lyon' as City
, '69004' as Country
UNION 
SELECT 85 as CustomerID
, 'Vins et alcools Chevalier' as CustomerName
, 'Paul Henriot' as ContactName
, '59 rue de l''Abbaye' as Address
, 'Reims' as City
, '51100' as Country
UNION 
SELECT 86 as CustomerID
, 'Die Wandernde Kuh' as CustomerName
, 'Rita Müller' as ContactName
, 'Adenauerallee 900' as Address
, 'Stuttgart' as City
, '70563' as Country
UNION 
SELECT 87 as CustomerID
, 'Wartian Herkku' as CustomerName
, 'Pirkko Koskitalo' as ContactName
, 'Torikatu 38' as Address
, 'Oulu' as City
, '90110' as Country
UNION 
SELECT 88 as CustomerID
, 'Wellington Importadora' as CustomerName
, 'Paula Parente' as ContactName
, 'Rua do Mercado, 12' as Address
, 'Resende' as City
, '08737-363' as Country
UNION 
SELECT 89 as CustomerID
, 'White Clover Markets' as CustomerName
, 'Karl Jablonski' as ContactName
, '305 - 14th Ave. S. Suite 3B' as Address
, 'Seattle' as City
, '98128' as Country
UNION 
SELECT 90 as CustomerID
, 'Wilman Kala' as CustomerName
, 'Matti Karttunen' as ContactName
, 'Keskuskatu 45' as Address
, 'Helsinki' as City
, '21240' as Country
UNION 
SELECT 91 as CustomerID
, 'Wolski' as CustomerName
, 'Zbyszek' as ContactName
, 'ul. Filtrowa 68' as Address
, 'Walla' as City
, '01-012' as Country
)
SELECT s1.*
  FROM s1;
GO


