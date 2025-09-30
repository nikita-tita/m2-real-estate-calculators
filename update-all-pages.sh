#!/bin/bash

# Скрипт для добавления M2 layout компонентов во все HTML страницы калькуляторов

# Список основных страниц калькуляторов
PAGES=(
    "mortgage_calculator.html"
    "rental_profitability_calculator.html"
    "affordability_calculator.html"
    "rent_vs_buy_calculator.html"
    "airbnb_calculator.html"
    "new_vs_secondary_calculator.html"
    "compound_interest_calculator.html"
    "advanced_compound_calculator.html"
    "prepayment_calculator.html"
)

for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo "Обновляю $page..."

        # Проверяем, есть ли уже подключение m2-layout.js
        if ! grep -q "m2-layout.js" "$page"; then
            # Добавляем скрипт перед закрывающим </body>
            sed -i '' 's|</body>|<script src="m2-layout.js"></script>\n</body>|' "$page"
        fi

        # Обновляем theme-color на M2 purple
        sed -i '' 's|theme-color" content="[^"]*"|theme-color" content="#4F2CD9"|' "$page"

        # Обновляем background color в body
        sed -i '' 's|background: #f9fafb|background: #FFFFFF|g' "$page"

        echo "✓ $page обновлен"
    fi
done

echo "Готово! Все страницы обновлены."