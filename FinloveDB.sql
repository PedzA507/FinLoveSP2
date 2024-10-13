CREATE DATABASE  IF NOT EXISTS `finlove` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `finlove`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: finlove
-- ------------------------------------------------------
-- Server version	8.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `education`
--

DROP TABLE IF EXISTS `education`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `education` (
  `educationID` int NOT NULL AUTO_INCREMENT,
  `EducationName` varchar(255) NOT NULL,
  PRIMARY KEY (`educationID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `education`
--

LOCK TABLES `education` WRITE;
/*!40000 ALTER TABLE `education` DISABLE KEYS */;
INSERT INTO `education` VALUES (1,'มัธยมศึกษา'),(2,'ปริญญาตรี'),(3,'ปริญญาโท'),(4,'ปริญญาเอก'),(5,'กำลังทำงาน');
/*!40000 ALTER TABLE `education` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `empID` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `phonenumber` char(10) DEFAULT NULL,
  `gender` tinyint DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(100) NOT NULL,
  `imageFile` varchar(100) DEFAULT NULL,
  `positionID` tinyint DEFAULT NULL,
  `loginAttempt` tinyint DEFAULT '0',
  `lastAttemptTime` datetime DEFAULT NULL,
  `isActive` tinyint DEFAULT '1',
  PRIMARY KEY (`empID`),
  UNIQUE KEY `username` (`username`),
  KEY `positionID` (`positionID`),
  CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`positionID`) REFERENCES `position` (`positionID`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (2,'ปริญ','วรกมล','0898763723',1,'parin@hotmail.com','admin','$2a$10$NY/tG0DPjsdaE1TMbagI4uoZVtwbZF.xt4uf/khIQuHp1RpOYuhCm','img2.png',1,0,NULL,1),(3,'สมชาย','หารณรงค์','0862134496',1,'somchai@gmail.com','ant','$2a$10$9PA9zeFRXx1U1zSnhODMw..X87PmIqN8axlC6JaP0fhxEO8OYN3Ti','img3.jpg',1,2,'2024-10-11 14:40:57',1),(4,'กาญจนา','กิ่งแก้ว','0868927364',1,'karnjana@gmail.com','karnjana','$2a$10$9PA9zeFRXx1U1zSnhODMw..X87PmIqN8axlC6JaP0fhxEO8OYN3Ti','img4.jpg',2,0,NULL,0),(5,'ขนิษฐา','กองแก้ว','0893524367',1,'khanitha@hotmail.com','khanitha','$2a$10$9PA9zeFRXx1U1zSnhODMw..X87PmIqN8axlC6JaP0fhxEO8OYN3Ti','img5.jpg',2,0,NULL,1),(6,'พิเชษ','เจตจำนงค์','0896789076',1,'pichet@hotmail.com','pichet','$2a$10$9PA9zeFRXx1U1zSnhODMw..X87PmIqN8axlC6JaP0fhxEO8OYN3Ti','img6.jpg',2,0,NULL,1),(7,'นิดา','แสนสุข','0897658261',1,'nida@gmail.com','nida','$2a$10$9PA9zeFRXx1U1zSnhODMw..X87PmIqN8axlC6JaP0fhxEO8OYN3Ti','img7.jpg',2,0,NULL,1),(8,'นิตยา','สุขใจ','0898733827',1,'nitaya@gmail.com','nitaya','$2a$10$9PA9zeFRXx1U1zSnhODMw..X87PmIqN8axlC6JaP0fhxEO8OYN3Ti','img8.jpg',2,0,NULL,0),(9,'สรศักดิ์','หาญกล้า','0895767898',1,'sorasak@gmail.com','sorasak','$2a$10$9PA9zeFRXx1U1zSnhODMw..X87PmIqN8axlC6JaP0fhxEO8OYN3Ti','img9.jpg',2,0,NULL,0),(10,'สมชาติ','ใจดี','0897652875',1,'somechai@gmail.com','somchat','$2a$10$9PA9zeFRXx1U1zSnhODMw..X87PmIqN8axlC6JaP0fhxEO8OYN3Ti','img10.jpg',2,0,NULL,0),(11,'ped','ped',NULL,1,'ped','ped','$2a$10$NY/tG0DPjsdaE1TMbagI4uoZVtwbZF.xt4uf/khIQuHp1RpOYuhCm','img2.png',1,0,NULL,1),(14,'Methaporn','Limrostham',NULL,1,'pedza507@gmail.com','antff','$2a$10$oCSxPPo0DWOLxOj2HR/N5O160I8GMcHliLbIwCMw.mli1F3kn.zk.','img2.png',NULL,0,NULL,1);
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gender`
--

DROP TABLE IF EXISTS `gender`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gender` (
  `GenderID` int NOT NULL AUTO_INCREMENT,
  `Gender_Name` varchar(255) NOT NULL,
  PRIMARY KEY (`GenderID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gender`
--

LOCK TABLES `gender` WRITE;
/*!40000 ALTER TABLE `gender` DISABLE KEYS */;
INSERT INTO `gender` VALUES (1,'Male'),(2,'Female'),(3,'Other');
/*!40000 ALTER TABLE `gender` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `goal`
--

DROP TABLE IF EXISTS `goal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goal` (
  `goalID` int NOT NULL AUTO_INCREMENT,
  `goalName` varchar(255) NOT NULL,
  PRIMARY KEY (`goalID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goal`
--

LOCK TABLES `goal` WRITE;
/*!40000 ALTER TABLE `goal` DISABLE KEYS */;
INSERT INTO `goal` VALUES (1,'หาคู่รักที่จริงใจ'),(2,'หาคู่เดทช่วงสั้นๆ'),(3,'หาเพื่อนใหม่'),(4,'ยังไม่แน่ใจ');
/*!40000 ALTER TABLE `goal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interestgender`
--

DROP TABLE IF EXISTS `interestgender`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interestgender` (
  `interestGenderID` int NOT NULL AUTO_INCREMENT,
  `interestGenderName` varchar(255) NOT NULL,
  PRIMARY KEY (`interestGenderID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interestgender`
--

LOCK TABLES `interestgender` WRITE;
/*!40000 ALTER TABLE `interestgender` DISABLE KEYS */;
INSERT INTO `interestgender` VALUES (1,'Male'),(2,'Female'),(3,'Other');
/*!40000 ALTER TABLE `interestgender` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `position`
--

DROP TABLE IF EXISTS `position`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `position` (
  `positionID` tinyint NOT NULL,
  `positionName` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`positionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `position`
--

LOCK TABLES `position` WRITE;
/*!40000 ALTER TABLE `position` DISABLE KEYS */;
INSERT INTO `position` VALUES (1,'Admin'),(2,'Employee');
/*!40000 ALTER TABLE `position` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferences`
--

DROP TABLE IF EXISTS `preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preferences` (
  `PreferenceID` int NOT NULL AUTO_INCREMENT,
  `PreferenceNames` varchar(255) NOT NULL,
  PRIMARY KEY (`PreferenceID`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferences`
--

LOCK TABLES `preferences` WRITE;
/*!40000 ALTER TABLE `preferences` DISABLE KEYS */;
INSERT INTO `preferences` VALUES (1,'ฟุตบอล'),(2,'ภาพยนตร์'),(3,'ท่องเที่ยว'),(4,'อนิเมชั่น'),(5,'ช็อปปิ้ง'),(6,'เล่นดนตรี'),(7,'เล่นกีฬา'),(8,'เล่นเกม'),(9,'อ่านหนังสือ'),(10,'ปาร์ตี้'),(11,'สายควัน'),(12,'ออกกำลังกาย'),(13,'ตกปลา'),(14,'รักสัตว์'),(15,'ของหวาน'),(16,'ถ่ายรูป');
/*!40000 ALTER TABLE `preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report`
--

DROP TABLE IF EXISTS `report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report` (
  `reportID` int NOT NULL,
  `reportType` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`reportID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report`
--

LOCK TABLES `report` WRITE;
/*!40000 ALTER TABLE `report` DISABLE KEYS */;
INSERT INTO `report` VALUES (1,'Gore'),(2,'Spam'),(3,'Nudity');
/*!40000 ALTER TABLE `report` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `username` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `firstname` varchar(20) DEFAULT NULL,
  `lastname` varchar(20) DEFAULT NULL,
  `nickname` varchar(15) DEFAULT NULL,
  `email` varchar(40) DEFAULT NULL,
  `phonenumber` varchar(10) DEFAULT NULL,
  `height` float DEFAULT NULL,
  `home` varchar(255) DEFAULT NULL,
  `DateBirth` date DEFAULT NULL,
  `imageFile` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GenderID` int DEFAULT NULL,
  `educationID` int DEFAULT NULL,
  `goalID` int DEFAULT NULL,
  `interestGenderID` int DEFAULT NULL,
  `loginAttempt` tinyint NOT NULL DEFAULT '0',
  `lastAttemptTime` timestamp NULL DEFAULT NULL,
  `pinCode` varchar(10) DEFAULT NULL,
  `pinCodeExpiration` datetime DEFAULT NULL,
  `isActive` tinyint DEFAULT '1',
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `UserID_UNIQUE` (`UserID`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `educationID` (`educationID`),
  KEY `goalID` (`goalID`),
  KEY `interestGenderID` (`interestGenderID`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`educationID`) REFERENCES `education` (`educationID`),
  CONSTRAINT `user_ibfk_2` FOREIGN KEY (`goalID`) REFERENCES `goal` (`goalID`),
  CONSTRAINT `user_ibfk_4` FOREIGN KEY (`interestGenderID`) REFERENCES `interestgender` (`interestGenderID`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (59,'ant','$2b$10$Nc1djZxtVJcOM0Q/VW.0Au8w0i3SBCGwk99838v7kJlSKmh5soam6','Methaporn','Limrostham','Ant','pedza506@gmail.com','0642727318',180,'Bangkok','2003-10-07','image1525654779938797799.jpg',1,2,1,2,0,'2024-10-12 08:47:40',NULL,NULL,1),(60,'test','$2b$10$yD548UH0t5FsrnhLIR8hluEQjqoj4zXsBGi0O9uIt1jM5oqFn2qrC','firstname','lastname','nickname','email','9999',400,'home','2003-10-01','image1525654779938797799.jpg',2,3,1,1,0,'2024-10-04 10:10:37',NULL,NULL,1),(61,'beamdota','$2b$10$Nc1djZxtVJcOM0Q/VW.0Au8w0i3SBCGwk99838v7kJlSKmh5soam6','vorrapat','kobsinkha','beam','9beamdota@gmail.com','0855240541',171,'Bangkok','0200-08-07','image1525654779938797799.jpg',1,2,1,2,0,'2024-10-04 10:13:13',NULL,NULL,1),(82,'Praewa','$2b$10$q5dKjQKmjo.xSpR5R04qe.409Cr5/H63vi0JoQJA/YLJesX/B8dEO','Praewa','Praewa','Praewa','Praewa','1111',160,'Praewa','2024-10-06','image1525654779938797799.jpg',2,2,3,NULL,0,'2024-10-05 19:44:06',NULL,NULL,1),(84,'james','$2b$10$1E1RHi7TNFVcBDywse8FFOhh254CFxzWnj/Jk/tt2TDLVeZ1VjwlC','james','james','james','james','33333',2222,'james','2024-10-01','image1525654779938797799.jpg',1,3,3,2,0,'2024-10-08 14:49:17',NULL,NULL,1),(96,'jeff','$2b$10$Oc6OqxiMS3skzTw2zOvJcO9JMCLS1WlYgaGo9oZJcLioOINycLifC','jeff','jeff','jeff','jeff','1654221',180,'jeff','2024-10-04','image1525654779938797799.jpg',2,1,3,2,0,NULL,NULL,NULL,1),(97,'geg','$2b$10$LTH88HvhZlHskWA61Q8oDe9TbYnaHlovN2XOgBrJlz3dnSP3.4zmi','grokegr','grgre','gergre','opmopgre','24342',423242000,'rgeg','2024-10-01','image1525654779938797799.jpg',2,2,3,2,0,NULL,NULL,NULL,1),(102,'adminn','$2a$10$UfDvgAEcB7awzUm5BcOqR./Ke4B8IqIry5skOyDEAnP2FxcLcht02','adminn','adminn',NULL,'adminn','0000',NULL,'adminn',NULL,'image1525654779938797799.jpg',NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,1),(103,'ban','$2b$10$UF.D/AHTEQKdLLafFfMoXOHdSf.GYxc/I/6tcGSTFVM3LGPri209.','ban','ban','ban','ban','5588855665',255,'ban','2024-10-02','image1525654779938797799.jpg',2,2,4,3,0,NULL,NULL,NULL,1),(104,'bvb','$2b$10$VKi.sy8wn/nG1FggSIXrSO9ZxFCMLD/Xu.bEE/nFzpdKgdWfvmToe','nnn','mmm','ggggggg','bvb','4324324434',423,'hjthtrhtr','2024-10-01','image1525654779938797799.jpg',2,4,1,2,0,'2024-10-11 10:15:09',NULL,NULL,1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userpreferences`
--

DROP TABLE IF EXISTS `userpreferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userpreferences` (
  `UserID` int NOT NULL,
  `PreferenceID` int NOT NULL,
  PRIMARY KEY (`UserID`,`PreferenceID`),
  KEY `PreferenceID` (`PreferenceID`),
  CONSTRAINT `userpreferences_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `userpreferences_ibfk_2` FOREIGN KEY (`PreferenceID`) REFERENCES `preferences` (`PreferenceID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userpreferences`
--

LOCK TABLES `userpreferences` WRITE;
/*!40000 ALTER TABLE `userpreferences` DISABLE KEYS */;
INSERT INTO `userpreferences` VALUES (59,1),(84,1),(59,2),(60,2),(82,2),(84,2),(60,3),(61,3),(82,3),(59,4),(96,4),(97,7),(104,7),(96,8),(104,11),(96,12),(97,13),(103,14),(97,15),(103,15),(104,15);
/*!40000 ALTER TABLE `userpreferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userreport`
--

DROP TABLE IF EXISTS `userreport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userreport` (
  `userreportID` int NOT NULL AUTO_INCREMENT,
  `reporterID` int NOT NULL,
  `reportedID` int NOT NULL,
  `reportID` int NOT NULL,
  PRIMARY KEY (`userreportID`),
  KEY `reporterID` (`reporterID`),
  KEY `reportedID` (`reportedID`),
  KEY `reportID` (`reportID`),
  CONSTRAINT `userreport_ibfk_1` FOREIGN KEY (`reporterID`) REFERENCES `user` (`UserID`),
  CONSTRAINT `userreport_ibfk_2` FOREIGN KEY (`reportedID`) REFERENCES `user` (`UserID`),
  CONSTRAINT `userreport_ibfk_3` FOREIGN KEY (`reportID`) REFERENCES `report` (`reportID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userreport`
--

LOCK TABLES `userreport` WRITE;
/*!40000 ALTER TABLE `userreport` DISABLE KEYS */;
INSERT INTO `userreport` VALUES (2,59,60,1),(3,59,84,1),(4,59,97,3),(5,59,97,2);
/*!40000 ALTER TABLE `userreport` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-13 15:54:33
