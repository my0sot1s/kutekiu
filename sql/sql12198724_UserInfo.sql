-- MySQL dump 10.13  Distrib 5.7.17, for macos10.12 (x86_64)
--
-- Host: sql12.freesqldatabase.com    Database: sql12198724
-- ------------------------------------------------------
-- Server version	5.5.54-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `UserInfo`
--

DROP TABLE IF EXISTS `UserInfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `UserInfo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `gender` int(1) DEFAULT NULL,
  `born` datetime DEFAULT NULL,
  `displayName` varchar(200) CHARACTER SET utf8 DEFAULT NULL,
  `dateCreated` datetime DEFAULT NULL,
  `permisstion` int(1) DEFAULT NULL,
  `verificationToken` varchar(100) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserInfo`
--

LOCK TABLES `UserInfo` WRITE;
/*!40000 ALTER TABLE `UserInfo` DISABLE KEYS */;
INSERT INTO `UserInfo` VALUES (31,'tenm','$2a$10$ZC9wqjihgC/uLG7PogMqKOhrQm4aylFS4ErSKzPzLbgFa7Bk1xMR2','manhte231@gmail.com',NULL,NULL,NULL,'Te Nguyen','2017-11-18 16:08:15',NULL,NULL,NULL),(32,'cuongnd','$2a$10$qOP9xU5fYDG5dU0iNZKd8O0NxKkHRpF.sYwtHRPtq6oE6yy7rP8sC','cuongheo@gmail.con',NULL,NULL,NULL,'Cuong Nguyen','2017-11-18 16:33:05',NULL,NULL,NULL),(33,'hoaitt','$2a$10$zkb4w9AI2Da9yd.6tON9h.mbGV1H2cuKf7rszAaMjwMfvWNQXgqMS','hoaitt@gg.com',NULL,NULL,NULL,'Thu Hoài','2017-11-18 16:35:33',NULL,NULL,NULL),(34,'haont','$2a$10$UHFbO264rSeew/9yvBD.W.lt5.n.H152zpTxdEyZi0pXuOcG8ZkeS','haont@gm.c',NULL,NULL,NULL,'Nguyễn Hảo ','2017-11-18 16:35:50',NULL,NULL,NULL),(35,'hiepth','$2a$10$q0I/k2eDZz/T8dUgrW6aUuhmFqhia2Lyy.bAFKYObLlTTjj5BJcXC','hiepth@fdfdf.com',NULL,NULL,NULL,'Tô Hiệp','2017-11-18 17:54:54',NULL,NULL,NULL);
/*!40000 ALTER TABLE `UserInfo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-11-20  8:15:07
