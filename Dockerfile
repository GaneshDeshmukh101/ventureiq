FROM php:8.2-apache

# Install required PHP extensions
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Enable Apache URL rewriting
RUN a2enmod rewrite

# Set the website's public directory as Apache's document root
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

# Update Apache configuration safely
RUN sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf 
    && sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/conf-available/*.conf

WORKDIR /var/www/html

# Copy project files
COPY . /var/www/html/

# Verify the database SSL certificate exists
RUN test -f /var/www/html/certs/ca.pem 
    && chmod 644 /var/www/html/certs/ca.pem

# Set permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80