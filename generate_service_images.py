import os
from PIL import Image, ImageDraw

os.makedirs("assets", exist_ok=True)

def create_vigia_img(path):
    width, height = 800, 600
    img = Image.new("RGB", (width, height), color="#0e1017")
    draw = ImageDraw.Draw(img)
    
    for x in range(0, width, 40):
        draw.line([(x, 0), (x, height)], fill="#181c28", width=1)
    for y in range(0, height, 40):
        draw.line([(0, y), (width, y)], fill="#181c28", width=1)

    draw.rectangle([(150, 100), (650, 480)], fill="#161a24", outline="#e0182b", width=4)
    draw.rectangle([(170, 120), (630, 220)], fill="#080a0f", outline="#30384c", width=2)
    
    draw.text((200, 140), "VIGIA 500", fill="#e0182b")
    draw.text((200, 175), "PRES. ACEITE: 4.2 BAR [OK]", fill="#00e676")
    draw.text((430, 175), "TEMP: 88 C [OK]", fill="#00e676")
    
    draw.ellipse([(200, 280), (240, 320)], fill="#00e676", outline="#ffffff")
    draw.text((255, 290), "MOTOR EN GUARDIA", fill="#ffffff")
    
    draw.ellipse([(200, 340), (240, 380)], fill="#ff9100", outline="#ffffff")
    draw.text((255, 350), "ALERTA TEMPERATURA", fill="#ffffff")
    
    draw.ellipse([(200, 400), (240, 440)], fill="#e0182b", outline="#ffffff")
    draw.text((255, 410), "CORTE AUTOMATICO", fill="#ffffff")

    draw.rectangle([(480, 280), (600, 440)], fill="#2a3042", outline="#8a95b0", width=3)
    draw.text((495, 350), "SENSOR OEM\nVIGIA", fill="#8a95b0")
    
    draw.rectangle([(0, 0), (width, 60)], fill="#e0182b")
    draw.text((240, 18), "PROTECTOR DE MOTOR VIGIA OFICIAL", fill="#ffffff")

    img.save(path, quality=95)

def create_viesa_img(path):
    width, height = 800, 600
    img = Image.new("RGB", (width, height), color="#0b131a")
    draw = ImageDraw.Draw(img)

    for x in range(0, width, 40):
        draw.line([(x, 0), (x, height)], fill="#12202c", width=1)

    draw.ellipse([(120, 140), (680, 440)], fill="#e8ecef", outline="#00bcd4", width=5)
    draw.ellipse([(220, 200), (580, 380)], fill="#1a2634", outline="#00bcd4", width=3)
    
    for i in range(260, 540, 35):
        draw.line([(i, 240), (i, 340)], fill="#00bcd4", width=4)

    draw.text((270, 280), "VIESA INTELLIGENT v11", fill="#ffffff")
    
    draw.arc([(100, 460), (700, 560)], start=0, end=180, fill="#00bcd4", width=4)
    draw.text((250, 490), "CLIMATIZADOR ECOLOGICO DE CABINA", fill="#00bcd4")

    draw.rectangle([(0, 0), (width, 60)], fill="#00bcd4")
    draw.text((240, 18), "ENFRIADORES Y CLIMATIZADORES VIESA", fill="#0a0b0e")

    img.save(path, quality=95)

def create_taller_img(path):
    width, height = 800, 600
    img = Image.new("RGB", (width, height), color="#12100e")
    draw = ImageDraw.Draw(img)

    draw.rectangle([(100, 100), (500, 480)], fill="#1c1a16", outline="#ff9800", width=4)
    draw.rectangle([(120, 120), (480, 320)], fill="#0a0907", outline="#52442d", width=2)
    
    draw.text((140, 140), "DIAGNOSTICO AUTOMOTRIZ COMPUTARIZADO", fill="#ff9800")
    draw.text((140, 175), "ESTADO BATERIA: 12.8V [100% Carga]", fill="#00e676")
    draw.text((140, 205), "ALTERNA: 14.2V [Cargando]", fill="#00e676")
    draw.text((140, 235), "SCANNER OBD2: Sin codigos de falla", fill="#00bcd4")
    
    draw.rectangle([(540, 140), (720, 460)], fill="#ff9800", outline="#ffffff", width=3)
    draw.rectangle([(560, 160), (700, 260)], fill="#080705")
    draw.text((580, 195), "14.20 V", fill="#00e676")

    draw.line([(580, 460), (480, 540)], fill="#e0182b", width=5)
    draw.line([(680, 460), (380, 540)], fill="#000000", width=5)

    draw.rectangle([(0, 0), (width, 60)], fill="#ff9800")
    draw.text((220, 18), "TALLER DE ELECTRICIDAD AUTOMOTRIZ", fill="#0a0b0e")

    img.save(path, quality=95)

def create_alarma_img(path):
    width, height = 800, 600
    img = Image.new("RGB", (width, height), color="#140d1a")
    draw = ImageDraw.Draw(img)

    draw.rectangle([(120, 120), (450, 440)], fill="#22162b", outline="#9c27b0", width=4)
    draw.text((150, 150), "PST POSITRON", fill="#9c27b0")
    draw.text((150, 185), "CENTRAL ALARMA FX-360", fill="#ffffff")
    
    draw.ellipse([(500, 140), (700, 340)], fill="#1a1220", outline="#9c27b0", width=4)
    draw.ellipse([(540, 180), (660, 300)], fill="#362244")
    draw.text((560, 230), "SIRENA 120dB", fill="#ffffff")

    draw.rectangle([(520, 370), (680, 530)], fill="#2d2238", outline="#ffffff", width=2)
    draw.ellipse([(560, 390), (640, 440)], fill="#e0182b")
    draw.ellipse([(560, 450), (640, 500)], fill="#00e676")

    draw.rectangle([(0, 0), (width, 60)], fill="#9c27b0")
    draw.text((220, 18), "INSTALACION DE ALARMAS Y SEGURIDAD PST", fill="#ffffff")

    img.save(path, quality=95)

if __name__ == "__main__":
    create_vigia_img("assets/service_vigia.jpg")
    create_viesa_img("assets/service_viesa.jpg")
    create_taller_img("assets/service_taller.jpg")
    create_alarma_img("assets/service_alarma.jpg")
    print("All 4 service images successfully created!")
