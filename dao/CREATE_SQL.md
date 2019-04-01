```
DROP TABLE `users`;

CREATE TABLE `users` (
`open_id` varchar(50) NOT NULL,
`name` varchar(50) NULL,
`gender` int(11) NULL,
`avatar` varchar(255) NULL,
`city` varchar(50) NULL,
`province` varchar(50) NULL,
`create_at` datetime NULL,
`tag` varchar(50) NULL,
`country` varchar(50) NULL,
PRIMARY KEY (`open_id`) 
)
DEFAULT CHARACTER SET = utf8;


DROP TABLE `categories`;
CREATE TABLE `categories` (
`id` varchar(50) NOT NULL,
`icon` varchar(50) NULL,
`name` varchar(50) NULL,
`remark` varchar(255) NULL,
`type` int(11) NULL,
PRIMARY KEY (`id`) 
)
DEFAULT CHARACTER SET = utf8;

DROP TABLE `tally_2019_02`;

CREATE TABLE `tally_2019_02` (
`id` varchar(50) NOT NULL,
`open_id` varchar(50) NOT NULL,
`date` datetime NOT NULL,
`latitude` varchar(50) NULL,
`longitude` varchar(50) NULL,
`remark` varchar(200) NULL,
`cid` varchar(50) NOT NULL,
`summary` bigint NOT NULL,
`type_backup` int(11) NULL,
`create_at` datetime NOT NULL,
`date_format` varchar(50) NOT NULL,
PRIMARY KEY (`id`) 
)
DEFAULT CHARACTER SET = utf8;

CREATE TABLE `global_kv` (
	`id` varchar(50) NOT NULL,
	`global_key` varchar(50) NOT NULL,
	`global_value` varchar(255) NOT NULL,
	PRIMARY KEY (`id`)
) ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8 COLLATE=utf8_general_ci
COMMENT='基础key_value表';
```