FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev \
    && docker-php-ext-install pdo_mysql zip mbstring \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY composer.json composer.lock* ./
RUN composer install --no-interaction --prefer-dist --no-scripts

COPY . .

RUN composer dump-autoload --optimize

EXPOSE 8000

CMD sh -c "\
       [ -f .env ] || cp .env.example .env; \
       grep -q '^APP_KEY=.\+' .env || php artisan key:generate --force; \
       composer install --no-interaction --prefer-dist; \
       php artisan config:clear; \
       php artisan migrate --force; \
       php artisan serve --host=0.0.0.0 --port=8000 \
   "
