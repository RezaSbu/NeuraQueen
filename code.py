import os

# --- تنظیمات ---

# نام فایلی که نتیجه در آن ذخیره می‌شود
output_filename = "project_code_dump.txt"

# لیست پسوندهای فایل‌هایی که باید نادیده گرفته شوند (فایل‌های باینری، تصاویر، و...)
# می‌توانید این لیست را بر اساس نیاز خود تغییر دهید
extensions_to_skip = [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg',
    '.pdf', '.zip', '.rar', '.tar', '.gz',
    '.exe', '.dll', '.so', '.dylib',
    '.mp3', '.wav', '.mp4', '.avi', '.mov',
    '.ttf', '.woff', '.woff2', '.eot',
    '.pyc', '.pyo', '.pyd'
]

# --- شروع عملیات ---

print(f"در حال استخراج کدها... نتیجه در فایل '{output_filename}' ذخیره خواهد شد.")

# باز کردن فایل خروجی برای نوشتن (با انکدینگ utf-8 برای پشتیبانی از فارسی)
with open(output_filename, 'w', encoding='utf-8') as outfile:
    # پیمایش تمام پوشه‌ها و زیرپوشه‌ها از محل فعلی ('.')
    for dirpath, dirnames, filenames in os.walk('.'):
        for filename in filenames:
            # نادیده گرفتن فایل خروجی خودش برای جلوگیری از loop بی‌نهایت
            if filename == output_filename:
                continue

            # ساخت مسیر کامل فایل
            full_path = os.path.join(dirpath, filename)

            # نادیده گرفتن فایل‌های باینری و غیرمفید بر اساس پسوند
            if any(filename.lower().endswith(ext) for ext in extensions_to_skip):
                print(f"نادیده گرفته شد (فایل باینری): {full_path}")
                continue

            # تلاش برای خواندن محتوای فایل
            try:
                # خواندن فایل با انکدینگ utf-8
                with open(full_path, 'r', encoding='utf-8') as infile:
                    content = infile.read()

                    # نوشتن نام فایل و محتوای آن در فایل خروجی با فرمت خواسته شده
                    outfile.write(f"{full_path}:\n")
                    outfile.write(content)
                    outfile.write("\n" + "-"*25 + "\n")

            except UnicodeDecodeError:
                # اگر فایل با utf-8 باز نشد، یک خطا چاپ می‌کنیم و از آن رد می‌شویم
                print(f"خطا در خواندن (انکدینگ نامشخص): {full_path}")
                continue
            except Exception as e:
                # مدیریت سایر خطاها (مثلاً دسترسی نداشتن به فایل)
                print(f"خطا در پردازش فایل {full_path}: {e}")
                continue

print(f"\nعملیات با موفقیت تمام شد! تمام کدها در فایل '{output_filename}' ذخیره شدند.")