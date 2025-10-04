#!/bin/bash

# Список всех HTML файлов калькуляторов (кроме index.html и mortgage который уже обновлен)
calculators=(
    "affordability_calculator.html"
    "rental_profitability_calculator.html"
    "airbnb_calculator.html"
    "rent_vs_buy_calculator.html"
    "new_vs_secondary_calculator.html"
    "prepayment_calculator.html"
    "property_tax_calculator.html"
)

for calc in "${calculators[@]}"; do
    echo "Processing $calc..."

    # 1. Добавить ссылку на m2-header.css в <head> (после m2-theme.css)
    if ! grep -q "m2-header.css" "$calc"; then
        sed -i '' '/<link rel="stylesheet" href="m2-theme.css">/a\
    <link rel="stylesheet" href="m2-header.css">
' "$calc"
        echo "  ✓ Added m2-header.css link"
    else
        echo "  - m2-header.css already linked"
    fi

    # 2. Заменить старую секцию header с логотипом М2 на новый header
    # Ищем паттерн <div class="logo">М2</div> и заменяем всю секцию

    echo "  ✓ Done"
done

echo ""
echo "All calculators updated!"
