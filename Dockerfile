<<<<<<< HEAD
FROM php:8.2-apache

RUN docker-php-ext-install pdo pdo_mysql mysqli

RUN a2enmod rewrite

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf 
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}/!g' /etc/apache2/apache2.conf 
=======

FROM php:8.2-apache

# Install PHP extensions required by VentureIQ
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Enable Apache URL rewriting
RUN a2enmod rewrite

# Set the public folder as the web root
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}/!g' /etc/apache2/apache2.conf \
>>>>>>> 2fb8b4f (Prepare VentureIQ for cloud deployment)
    && sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/conf-available/*.conf

WORKDIR /var/www/html

<<<<<<< HEAD
COPY . /var/www/html/

=======
# Copy application files into the container
COPY . /var/www/html/

# Verify the Aiven CA certificate exists
RUN test -f /var/www/html/certs/ca.pem \
    && chmod 644 /var/www/html/certs/ca.pem

# Set application file permissions
>>>>>>> 2fb8b4f (Prepare VentureIQ for cloud deployment)
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
