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
) ENGINE=InnoDB AUTO_INCREMENT=114 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (105,'ant','$2b$10$MMF3Ff8A7m.pFq0EIB5eH.HCMSGEKL7whr6mpSn9bGeOJ7emlOEUO','Methaporn','Limrostham','Ant','pedza507@gmail.com','0642727318',180,'Bangkok','2003-10-07','image3334147071350462373.jpg',1,2,1,2,0,'2024-10-14 07:35:32',NULL,NULL,1),(106,'test1','$2b$10$oJDUE1lYMXMRKMNRibdBkulE4hrdp6/iWSa8ic8Cp6CuCciIJS4xq','test','test','test1','test1','1111111111',159,'test','2024-10-01','image5621395018744202777.jpg',2,1,1,2,0,'2024-10-14 07:29:31',NULL,NULL,1),(107,'test2','$2b$10$bPdUqXeanRG/uklqSLmv3eiGIkAC/V9TNOC4EouctpRMd.GcuRlke','test','test','test2','test2','2222222222',158,'test','2024-10-03','image4979801062980059018.jpg',2,3,1,1,0,'2024-10-14 07:30:31',NULL,NULL,1),(108,'test3','$2b$10$ocnNGDh5ma1PTf6p56L4vuPp3XVk0WWIuDO7YQyMloqHFWwIx.bQK','test','test','test3','test3','3333333333',175,'test','2024-10-04','image4916145192027822480.jpg',1,4,2,2,0,NULL,NULL,NULL,1),(109,'test4','$2b$10$lD5Xsab8U6yLah2jL4QKNeAvEmHKXiXyYWZdrLqryoL1TkRgWozSG','test','test','test4','test4','4444444444',163,'test','2024-10-02','image4143559456358884421.jpg',2,2,1,1,0,NULL,NULL,NULL,1),(110,'test5','$2b$10$oJDUE1lYMXMRKMNRibdBkulE4hrdp6/iWSa8ic8Cp6CuCciIJS4xq','test','test','test5','test5','5555555555',159,'test','2024-10-01','image5621395018744202777.jpg',2,1,1,2,0,NULL,NULL,NULL,1),(111,'test6','$2b$10$bPdUqXeanRG/uklqSLmv3eiGIkAC/V9TNOC4EouctpRMd.GcuRlke','test','test','test6','test6','6666666666',158,'test','2024-10-03','image4979801062980059018.jpg',2,3,1,2,0,NULL,NULL,NULL,1),(112,'test7','$2b$10$ocnNGDh5ma1PTf6p56L4vuPp3XVk0WWIuDO7YQyMloqHFWwIx.bQK','test','test','test7','test7','7777777777',175,'test','2024-10-04','image4916145192027822480.jpg',2,4,2,1,0,NULL,NULL,NULL,1),(113,'test8','$2b$10$lD5Xsab8U6yLah2jL4QKNeAvEmHKXiXyYWZdrLqryoL1TkRgWozSG','test','test','test8','test8','8888888888',163,'test','2024-10-02','image4143559456358884421.jpg',2,2,1,1,0,NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userdislike`
--

DROP TABLE IF EXISTS `userdislike`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userdislike` (
  `dislikeID` int NOT NULL AUTO_INCREMENT,
  `dislikerID` int NOT NULL,
  `dislikedID` int NOT NULL,
  PRIMARY KEY (`dislikeID`),
  KEY `userdislike_ibfk_1` (`dislikerID`),
  KEY `userdislike_ibfk_2` (`dislikedID`),
  CONSTRAINT `userdislike_ibfk_1` FOREIGN KEY (`dislikerID`) REFERENCES `user` (`UserID`),
  CONSTRAINT `userdislike_ibfk_2` FOREIGN KEY (`dislikedID`) REFERENCES `user` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userdislike`
--

LOCK TABLES `userdislike` WRITE;
/*!40000 ALTER TABLE `userdislike` DISABLE KEYS */;
INSERT INTO `userdislike` VALUES (10,105,106),(11,105,108);
/*!40000 ALTER TABLE `userdislike` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userlike`
--

DROP TABLE IF EXISTS `userlike`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userlike` (
  `likeID` int NOT NULL AUTO_INCREMENT,
  `likerID` int NOT NULL,
  `likedID` int NOT NULL,
  PRIMARY KEY (`likeID`),
  KEY `likerID` (`likerID`),
  KEY `likedID` (`likedID`),
  CONSTRAINT `userlike_ibfk_1` FOREIGN KEY (`likerID`) REFERENCES `user` (`UserID`),
  CONSTRAINT `userlike_ibfk_2` FOREIGN KEY (`likedID`) REFERENCES `user` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=170 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userlike`
--

LOCK TABLES `userlike` WRITE;
/*!40000 ALTER TABLE `userlike` DISABLE KEYS */;
INSERT INTO `userlike` VALUES (116,105,106),(117,105,107),(118,105,108),(119,105,109),(120,105,106),(121,105,107),(122,105,108),(123,105,109),(124,105,106),(125,105,107),(126,105,108),(127,105,109),(128,105,106),(129,105,107),(130,105,108),(131,105,109),(132,105,106),(133,105,107),(134,105,108),(135,105,109),(136,105,106),(137,105,107),(138,105,108),(139,105,109),(140,105,106),(141,105,107),(142,105,108),(143,105,109),(144,105,106),(145,105,107),(146,105,108),(147,105,109),(148,106,105),(149,106,107),(150,106,108),(151,106,109),(152,106,105),(153,106,107),(154,106,108),(155,106,109),(156,106,105),(157,107,105),(158,107,106),(159,107,108),(160,107,109),(161,107,105),(162,105,106),(163,105,107),(164,105,108),(165,105,109),(166,105,106),(167,105,108),(168,105,109),(169,105,106);
/*!40000 ALTER TABLE `userlike` ENABLE KEYS */;
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
INSERT INTO `userpreferences` VALUES (105,1),(107,1),(108,1),(111,1),(112,1),(105,2),(107,2),(108,2),(111,2),(112,2),(105,4),(107,4),(108,4),(109,4),(111,4),(112,4),(113,4),(109,10),(113,10),(109,11),(113,11),(106,13),(110,13),(106,14),(110,14),(106,15),(110,15);
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userreport`
--

LOCK TABLES `userreport` WRITE;
/*!40000 ALTER TABLE `userreport` DISABLE KEYS */;
INSERT INTO `userreport` VALUES (14,105,106,2),(15,105,106,3);
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

-- Dump completed on 2024-10-14 14:48:26
