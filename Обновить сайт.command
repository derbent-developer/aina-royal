#!/bin/zsh
# ─────────────────────────────────────────────────────────────
#  Айна Рояль — обновление сайта
#  Двойной щелчок по этому файлу отправляет все изменения
#  на GitHub. Через 1–2 минуты они появятся на сайте.
# ─────────────────────────────────────────────────────────────

cd "$(dirname "$0")" || exit 1

BOLD=$'\e[1m'; DIM=$'\e[2m'; GREEN=$'\e[32m'; RED=$'\e[31m'; YELLOW=$'\e[33m'; OFF=$'\e[0m'
SITE="https://derbent-developer.github.io/aina-royal/"

finish () {
  echo
  echo "${DIM}Окно можно закрыть (⌘W).${OFF}"
  read -r "?Нажмите Enter…"
  exit "$1"
}

echo
echo "${BOLD}Айна Рояль — обновление сайта${OFF}"
echo "${DIM}$(pwd)${OFF}"
echo

# ── есть ли что отправлять ───────────────────────────────────
if [[ -z "$(git status --porcelain)" ]] && [[ -z "$(git log origin/main..HEAD 2>/dev/null)" ]]; then
  echo "${GREEN}Всё уже опубликовано — новых изменений нет.${OFF}"
  echo "Сайт: $SITE"
  finish 0
fi

# ── что именно изменилось ────────────────────────────────────
echo "${BOLD}Изменения:${OFF}"
git -c core.quotepath=false status --short | sed 's/^/  /'
echo

# ── тяжёлые файлы GitHub не примет ───────────────────────────
BIG=""
while IFS= read -r f; do
  git check-ignore -q "$f" || BIG="$BIG$f\n"      # то, что игнорируется, не мешает
done < <(find . -type f -size +95M -not -path './.git/*' 2>/dev/null)

if [[ -n "$BIG" ]]; then
  echo "${YELLOW}Эти файлы больше 95 МБ — GitHub их не примет:${OFF}"
  printf "$BIG" | sed 's/^/  /'
  echo "${DIM}Уберите их из папки, иначе отправка сорвётся.${OFF}"
  echo
fi

# ── подпись коммита ──────────────────────────────────────────
echo "${BOLD}Что поменяли?${OFF} ${DIM}(можно просто нажать Enter)${OFF}"
read -r "MSG?→ "
[[ -z "$MSG" ]] && MSG="Обновление сайта $(date '+%d.%m.%Y %H:%M')"

# ── сдвигаем версию, иначе браузеры отдадут старый кэш ───────
if git diff --name-only --cached HEAD 2>/dev/null | grep -qE 'assets/(css|js)/' || \
   git diff --name-only | grep -qE 'assets/(css|js)/'; then
  V=$(grep -o 'style\.css?v=[0-9]*' index.html | head -1 | sed 's/.*v=//')
  if [[ -n "$V" ]]; then
    NEW=$((V + 1))
    sed -i '' "s/?v=$V/?v=$NEW/g" index.html
    echo "${DIM}Версия стилей и скриптов: v$V → v$NEW${OFF}"
  fi
fi

# ── отправка ─────────────────────────────────────────────────
echo
echo "${DIM}Сохраняю…${OFF}"
git add -A || finish 1
git commit -q -m "$MSG" || true

echo "${DIM}Отправляю на GitHub…${OFF}"
if git push origin main; then
  echo
  echo "${GREEN}${BOLD}Готово.${OFF}"
  echo "Сайт обновится через 1–2 минуты: $SITE"
  echo
  echo "${DIM}Открыть сайт? (y — да)${OFF}"
  read -r "OPEN?→ "
  [[ "$OPEN" == "y" || "$OPEN" == "Y" || "$OPEN" == "д" ]] && open "$SITE"
  finish 0
else
  echo
  echo "${RED}${BOLD}Отправить не удалось.${OFF}"
  echo
  echo "Частые причины:"
  echo "  • нет интернета или включён VPN, который его режет"
  echo "  • кто-то менял репозиторий с другого компьютера —"
  echo "    тогда выполните: ${BOLD}git pull --rebase origin main${OFF} и запустите файл заново"
  echo "  • файл тяжелее 100 МБ (см. предупреждение выше)"
  finish 1
fi
