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
  `EducationID` int NOT NULL AUTO_INCREMENT,
  `EducationName` varchar(255) NOT NULL,
  PRIMARY KEY (`EducationID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `education`
--

LOCK TABLES `education` WRITE;
/*!40000 ALTER TABLE `education` DISABLE KEYS */;
INSERT INTO `education` VALUES (1,'มัธยมศึกษา'),(2,'ปรัญญาตรี'),(3,'ปรัญญาโท'),(4,'ปรัญญาเอก');
/*!40000 ALTER TABLE `education` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goal`
--

LOCK TABLES `goal` WRITE;
/*!40000 ALTER TABLE `goal` DISABLE KEYS */;
INSERT INTO `goal` VALUES (1,'ลดน้ำหนัก'),(2,'เพิ่มกล้ามเนื้อ'),(3,'ออกกำลังกายเพื่อสุขภาพ');
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
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `MessageID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `Content` text,
  `TimeJoin` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `TimeQuit` timestamp NULL DEFAULT NULL,
  `Timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MessageID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferences`
--

LOCK TABLES `preferences` WRITE;
/*!40000 ALTER TABLE `preferences` DISABLE KEYS */;
INSERT INTO `preferences` VALUES (1,'ดูหนัง'),(2,'ฟังเพลง'),(3,'เล่นกีฬา');
/*!40000 ALTER TABLE `preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phonenumber` varchar(255) DEFAULT NULL,
  `height` float DEFAULT NULL,
  `home` varchar(255) DEFAULT NULL,
  `DateBirth` varchar(30) DEFAULT NULL,
  `imageFile` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `GenderID` int DEFAULT NULL,
  `educationID` int DEFAULT NULL,
  `goalID` int DEFAULT NULL,
  `interestGenderID` int DEFAULT NULL,
  `PreferenceID` int DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `loginAttempt` tinyint NOT NULL DEFAULT '0',
  `lastAttemptTime` timestamp NULL DEFAULT NULL,
  `resetToken` varchar(255) DEFAULT NULL,
  `resetTokenExpiration` datetime DEFAULT NULL,
  `pinCode` varchar(10) DEFAULT NULL,
  `pinCodeExpiration` datetime DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  KEY `educationID` (`educationID`),
  KEY `goalID` (`goalID`),
  KEY `PreferenceID` (`PreferenceID`),
  KEY `interestGenderID` (`interestGenderID`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`educationID`) REFERENCES `education` (`EducationID`),
  CONSTRAINT `user_ibfk_2` FOREIGN KEY (`goalID`) REFERENCES `goal` (`goalID`),
  CONSTRAINT `user_ibfk_3` FOREIGN KEY (`PreferenceID`) REFERENCES `preferences` (`PreferenceID`),
  CONSTRAINT `user_ibfk_4` FOREIGN KEY (`interestGenderID`) REFERENCES `interestgender` (`interestGenderID`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (11,'ant','$2b$10$05SPvnqEEQ2L.p4wVkRZCufeoOEwDxsNRw7iwDLRkKrB08ZwsrBKG','Methaporn','Limrostham','ANT','pedza507@gmail.com','0642727318',180,'satriwit','2024-09-25','image1137143508727635471.jpg',1,NULL,NULL,NULL,NULL,1,0,NULL,'d44abf99df6d57adf69d79ae2db8fbb804b8eeb0','2024-09-26 17:54:49',NULL,NULL),(22,'king','$2b$10$jcMNC4JxC3nPRcVUuA3WBOdVIX5xpLNDc16TObSYRRPgykNowOdXC','king','king','king','king','565656565',180,'fsfs','2024-09-03','image7502437546598082693.jpg',1,NULL,NULL,NULL,NULL,1,0,NULL,NULL,NULL,NULL,NULL),(23,'hh','$2b$10$XD0FuSQOW8oKw9SVsS/7L.xzXEMKBylr.g0ezMyZtmgtFIbKFap6.','hhh','h','hh','hh','545',45,'trgr','2024-09-11','image9195488414336697971.jpg',2,NULL,NULL,NULL,NULL,1,0,NULL,NULL,NULL,NULL,NULL),(24,'dd','$2b$10$BIvO/Br7l9L5ba85KxTmeeJJOI.ROXhxN44CUyRCqELpvCF1ZMi6m','dd','dd','dd','dd','222',222,'22','2024-09-11',NULL,1,NULL,NULL,NULL,NULL,1,0,NULL,NULL,NULL,NULL,NULL),(25,'22','$2b$10$sXeG0ajBO/MR/e3JwrfuW.nkXOouoMXQ6OmJrPXwX3YEGrpPzvVpy','22','222','22','22','2',222,'22','2024-09-13','image8828612421925419646.jpg',1,NULL,NULL,NULL,NULL,1,0,NULL,NULL,NULL,NULL,NULL),(27,'aa','$2b$10$ehpghBxyuJ8d18JCOWx5sOsKG75cuoe5pYO8PaO0Mfo7Ke4MQeO0W','aa','aa','aa','aa','32',23,'aaa','2024-09-19',NULL,1,2,NULL,NULL,NULL,1,0,NULL,NULL,NULL,NULL,NULL),(28,'uiu','$2b$10$RDKc4RTOclBKkH6dS93GSejxfOEfj8fXTsE28i5f0ygS7tv6owBRi','ui','ui','ui','ui','255',25,'ui','2024-09-26',NULL,2,2,NULL,NULL,NULL,1,0,NULL,NULL,NULL,NULL,NULL),(29,'xx','$2b$10$Gzg9YcCQvSlqlZkbFlbP1OVNwp9TSw3HhA8atVydy6XjyPN7wlsiK','xx','xx','xx','xx','225',222,'yhy','2024-09-26',NULL,1,2,NULL,NULL,NULL,1,0,NULL,NULL,NULL,NULL,NULL),(30,'ped','$2b$10$05SPvnqEEQ2L.p4wVkRZCufeoOEwDxsNRw7iwDLRkKrB08ZwsrBKG','zx','zxz','x','zx','23235',1223,'wda','2024-09-16','image5004035599162625996.jpg',1,2,1,2,NULL,1,0,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usereducation`
--

DROP TABLE IF EXISTS `usereducation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usereducation` (
  `UserEducationID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `EducationID` int NOT NULL,
  PRIMARY KEY (`UserEducationID`),
  KEY `UserID` (`UserID`),
  KEY `EducationID` (`EducationID`),
  CONSTRAINT `usereducation_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`),
  CONSTRAINT `usereducation_ibfk_2` FOREIGN KEY (`EducationID`) REFERENCES `education` (`EducationID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usereducation`
--

LOCK TABLES `usereducation` WRITE;
/*!40000 ALTER TABLE `usereducation` DISABLE KEYS */;
/*!40000 ALTER TABLE `usereducation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usergoal`
--

DROP TABLE IF EXISTS `usergoal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usergoal` (
  `userID` int NOT NULL,
  `goalID` int NOT NULL,
  PRIMARY KEY (`userID`,`goalID`),
  KEY `goalID` (`goalID`),
  CONSTRAINT `usergoal_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `user` (`UserID`),
  CONSTRAINT `usergoal_ibfk_2` FOREIGN KEY (`goalID`) REFERENCES `goal` (`goalID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usergoal`
--

LOCK TABLES `usergoal` WRITE;
/*!40000 ALTER TABLE `usergoal` DISABLE KEYS */;
INSERT INTO `usergoal` VALUES (22,2),(23,2),(25,3);
/*!40000 ALTER TABLE `usergoal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userinterestgender`
--

DROP TABLE IF EXISTS `userinterestgender`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userinterestgender` (
  `userInterestGenderID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `interestGenderID` int NOT NULL,
  PRIMARY KEY (`userInterestGenderID`),
  KEY `userID` (`userID`),
  KEY `interestGenderID` (`interestGenderID`),
  CONSTRAINT `userinterestgender_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `user` (`UserID`),
  CONSTRAINT `userinterestgender_ibfk_2` FOREIGN KEY (`interestGenderID`) REFERENCES `interestgender` (`interestGenderID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userinterestgender`
--

LOCK TABLES `userinterestgender` WRITE;
/*!40000 ALTER TABLE `userinterestgender` DISABLE KEYS */;
/*!40000 ALTER TABLE `userinterestgender` ENABLE KEYS */;
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
  CONSTRAINT `userpreferences_ibfk_2` FOREIGN KEY (`PreferenceID`) REFERENCES `preferences` (`PreferenceID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userpreferences`
--

LOCK TABLES `userpreferences` WRITE;
/*!40000 ALTER TABLE `userpreferences` DISABLE KEYS */;
INSERT INTO `userpreferences` VALUES (11,1),(23,1),(25,1),(30,1),(11,2),(23,2),(25,2),(22,3),(23,3),(30,3);
/*!40000 ALTER TABLE `userpreferences` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-28 13:38:21
