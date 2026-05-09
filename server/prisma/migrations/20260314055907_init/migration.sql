-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('citizen', 'volunteer', 'admin') NOT NULL DEFAULT 'citizen',
    `avatar_url` VARCHAR(500) NULL,
    `language_pref` ENUM('en', 'bn') NOT NULL DEFAULT 'en',
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `volunteers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `skills` VARCHAR(500) NULL,
    `availability` ENUM('available', 'busy', 'offline') NOT NULL DEFAULT 'offline',
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `volunteers_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sos_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `emergency_type` ENUM('flood', 'cyclone', 'landslide', 'fire', 'other') NOT NULL,
    `severity` INTEGER NOT NULL,
    `description` TEXT NULL,
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `status` ENUM('pending', 'acknowledged', 'in_progress', 'resolved', 'cancelled') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `sos_requests_user_id_idx`(`user_id`),
    INDEX `sos_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `disaster_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `incident_type` ENUM('flood', 'cyclone', 'landslide', 'fire', 'building_collapse', 'other') NOT NULL,
    `description` TEXT NOT NULL,
    `image_url` VARCHAR(500) NULL,
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('submitted', 'verified', 'rejected') NOT NULL DEFAULT 'submitted',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `disaster_reports_user_id_idx`(`user_id`),
    INDEX `disaster_reports_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shelters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `address` TEXT NOT NULL,
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `current_occupancy` INTEGER NOT NULL DEFAULT 0,
    `contact_phone` VARCHAR(20) NULL,
    `status` ENUM('open', 'full', 'closed') NOT NULL DEFAULT 'open',
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `shelters_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `volunteer_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `volunteer_id` INTEGER NOT NULL,
    `sos_request_id` INTEGER NULL,
    `task_type` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    `assigned_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `volunteer_assignments_sos_request_id_key`(`sos_request_id`),
    INDEX `volunteer_assignments_volunteer_id_idx`(`volunteer_id`),
    INDEX `volunteer_assignments_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `relief_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `relief_type` ENUM('food', 'water', 'medicine', 'clothing', 'shelter', 'other') NOT NULL,
    `quantity` VARCHAR(100) NOT NULL,
    `urgency` ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    `description` TEXT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `status` ENUM('pending', 'approved', 'rejected', 'dispatched', 'delivered') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `relief_requests_user_id_idx`(`user_id`),
    INDEX `relief_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `relief_distributions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `relief_request_id` INTEGER NOT NULL,
    `volunteer_id` INTEGER NULL,
    `approved_by` INTEGER NOT NULL,
    `delivery_status` ENUM('preparing', 'in_transit', 'delivered') NOT NULL DEFAULT 'preparing',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `relief_distributions_relief_request_id_idx`(`relief_request_id`),
    INDEX `relief_distributions_volunteer_id_idx`(`volunteer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('sos', 'alert', 'task', 'relief', 'system') NOT NULL DEFAULT 'system',
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_idx`(`user_id`),
    INDEX `notifications_is_read_idx`(`is_read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weather_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `district` VARCHAR(100) NOT NULL,
    `temperature` DECIMAL(5, 2) NULL,
    `humidity` DECIMAL(5, 2) NULL,
    `wind_speed` DECIMAL(5, 2) NULL,
    `rainfall` DECIMAL(7, 2) NULL,
    `water_level` DECIMAL(7, 2) NULL,
    `description` VARCHAR(200) NULL,
    `fetched_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `weather_logs_district_idx`(`district`),
    INDEX `weather_logs_fetched_at_idx`(`fetched_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_predictions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `district` VARCHAR(100) NOT NULL,
    `risk_score` DECIMAL(4, 3) NOT NULL,
    `risk_category` VARCHAR(20) NOT NULL,
    `explanation` TEXT NULL,
    `weather_log_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `risk_predictions_district_idx`(`district`),
    INDEX `risk_predictions_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_alerts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_by` INTEGER NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `severity` ENUM('info', 'warning', 'danger') NOT NULL DEFAULT 'info',
    `target_area` VARCHAR(200) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NULL,

    INDEX `admin_alerts_is_active_idx`(`is_active`),
    INDEX `admin_alerts_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `volunteers` ADD CONSTRAINT `volunteers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sos_requests` ADD CONSTRAINT `sos_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disaster_reports` ADD CONSTRAINT `disaster_reports_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shelters` ADD CONSTRAINT `shelters_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `volunteer_assignments` ADD CONSTRAINT `volunteer_assignments_volunteer_id_fkey` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `volunteer_assignments` ADD CONSTRAINT `volunteer_assignments_sos_request_id_fkey` FOREIGN KEY (`sos_request_id`) REFERENCES `sos_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `volunteer_assignments` ADD CONSTRAINT `volunteer_assignments_assigned_by_fkey` FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relief_requests` ADD CONSTRAINT `relief_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relief_distributions` ADD CONSTRAINT `relief_distributions_relief_request_id_fkey` FOREIGN KEY (`relief_request_id`) REFERENCES `relief_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relief_distributions` ADD CONSTRAINT `relief_distributions_volunteer_id_fkey` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relief_distributions` ADD CONSTRAINT `relief_distributions_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_predictions` ADD CONSTRAINT `risk_predictions_weather_log_id_fkey` FOREIGN KEY (`weather_log_id`) REFERENCES `weather_logs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_alerts` ADD CONSTRAINT `admin_alerts_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
