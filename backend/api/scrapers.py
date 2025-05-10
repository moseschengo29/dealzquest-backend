import random
import uuid
import requests
from bs4 import BeautifulSoup
import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time


import random
import logging

logger = logging.getLogger(__name__)

def scrape_products(query):
    results = []

    try:
        # for scraper in [scrape_jiji, scrape_jumia, scrape_kilimall]:
        for scraper in [scrape_jiji, scrape_jumia, scrape_kilimall]:
            try:
                scraped = scraper(query)
                if isinstance(scraped, list):
                    results.extend(scraped)
                else:
                    logger.warning(f"{scraper.__name__} returned non-list data")
            except Exception as inner_e:
                logger.error(f"Error in {scraper.__name__}: {inner_e}")
    except Exception as e:
        logger.critical(f"Critical error in scrape_products: {e}")

    random.shuffle(results)
    return results[:150]  # always return a list, even if empty



def scrape_jumia(query):
    try:
        url = f"https://www.jumia.co.ke/catalog/?q={query}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            return []

        soup = BeautifulSoup(response.content, 'html.parser')
        products = []

        product_cards = soup.select('article.prd')

        for card in product_cards:
            try:
                name = card.select_one('h3.name').text.strip()
                price_text = card.select_one('.prc').text.strip().replace('KSh', '').replace(',', '')
                price = int(float(price_text))
                image = card.select_one('img').get('data-src') or card.select_one('img').get('src')
                url_suffix = card.select_one('a.core').get('href')
                url = f"https://www.jumia.co.ke{url_suffix}"
                product_id = str(uuid.uuid4())[:8]

                products.append({
                    "id": product_id,
                    "name": name,
                    "price": price,
                    "image": image,
                    "source": "Jumia Kenya",
                    "url": url,
                    "rating": round(random.uniform(3.0, 5.0), 1)
                })
                # print(products)
            except Exception as e:
                print(f"Error parsing a Jumia product: {e}")
                continue

        return products
    except Exception as e:
        print(f"Error scraping Jumia: {e}")
        return []


def scrape_kilimall(query):
    try:
        url = f"https://www.kilimall.co.ke/search?q={query}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)'
        }
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return []

        soup = BeautifulSoup(response.content, 'html.parser')
        products = []

        product_cards = soup.select('.listing-item')

        for card in product_cards:
            try:
                anchor = card.select_one('a')
                if not anchor:
                    continue

                name_tag = card.select_one('.product-title')
                price_tag = card.select_one('.product-price')
                image_tag = card.select_one('img')

                name = name_tag.text.strip() if name_tag else "No name"
                price_text = price_tag.text.strip().replace("KSh", "").replace(",", "") if price_tag else "0"
                price = int(float(price_text)) if price_text else 0

                # Try extracting image URL from 'data-src' (for lazy loading) or 'src'
                if image_tag:
                    image = image_tag.get('data-src') or image_tag.get('src')  # Lazy loading check
                    # If the image URL is relative, prepend base URL
                    if image and not image.startswith('http'):
                        image = f"https://image.kilimall.com{image}"
                else:
                    image = None  # No image available

                product_url = anchor['href']
                if not product_url.startswith('http'):
                    product_url = f"https://www.kilimall.co.ke{product_url}"

                # Add the product to the list
                products.append({
                    "id": str(uuid.uuid4())[:8],
                    "name": name,
                    "price": price,
                    "image": image,
                    "source": "Kilimall",
                    "url": product_url,
                    "rating": round(random.uniform(3.0, 5.0), 1)
                })
            except Exception as e:
                print(f"Error parsing Kilimall product: {e}")
                continue

        return products

    except Exception as e:
        print(f"Error scraping Kilimall: {e}")
        return []
def scrape_masoko(query):
    # Implementation for Masoko
    pass


def scrape_jiji(query):

    try:
        url = f"https://jiji.co.ke/search?query={query}"
        headers = {
            'User-Agent': 'Mozilla/5.0'
        }
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return []

        soup = BeautifulSoup(response.content, 'html.parser')
        products = []

        product_cards = soup.select('.b-list-advert__gallery__item')

        for card in product_cards:
            try:
                anchor = card.select_one('a')
                if not anchor:
                    continue

                name_tag = card.select_one('.b-advert-title-inner')
                price_tag = card.select_one('.qa-advert-price')
                image_tag = card.select_one('img')

                name = name_tag.text.strip() if name_tag else "No title"
                price_text = price_tag.text.strip().replace("KSh", "").replace(",", "") if price_tag else "0"
                price = int(float(price_text)) if price_text else 0

                image = image_tag.get('src') or ""
                url = anchor.get('href')
                if not url.startswith('http'):
                    url = f"https://jiji.co.ke{url}"

                products.append({
                    "id": str(uuid.uuid4())[:8],
                    "name": name,
                    "price": price,
                    "image": image,
                    "source": "Jiji Kenya",
                    "url": url,
                    "rating": round(random.uniform(3.0, 5.0), 1)
                })
            except Exception as e:
                print(f"Error parsing Jiji product: {e}")
                continue

        return products
    except Exception as e:
        print(f"Error scraping Jiji: {e}")
        return []
    

def scrape_masoko(query):
    try:
        url = f"https://www.masoko.com/search-results?query={query}"
        headers = {
            'User-Agent': 'Mozilla/5.0'
        }
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print("Failed to fetch Masoko page")
            return []

        soup = BeautifulSoup(response.content, 'html.parser')
        products = []

        product_cards = soup.select('.mui-style-bb8yqv')
        print(product_cards)

        for card in product_cards:
            try:
                # Product name
                name_tag = card.select_one('[appearance="h2"]')
                name = name_tag.text.strip() if name_tag else "No name"

                # Price
                price_tag = card.select_one('[appearance="subtitle"]')
                price_text = price_tag.text.strip().replace('KES', '').replace(',', '') if price_tag else "0"
                price = int(float(price_text))

                # Image
                image_tag = card.select_one('img')
                image = image_tag.get('src') if image_tag else ""

                # URL
                url_tag = card.select_one('a[data-testid="product-card-linkout"]')
                url = "https://www.masoko.com" + url_tag.get('href') if url_tag else ""

                products.append({
                    "id": str(uuid.uuid4())[:8],
                    "name": name,
                    "price": price,
                    "image": image,
                    "source": "Masoko",
                    "url": url,
                    "rating": round(random.uniform(3.0, 5.0), 1)
                })
            except Exception as e:
                print(f"Error parsing Masoko product: {e}")
                continue

        return products
    except Exception as e:
        print(f"Error scraping Masoko: {e}")
        return []
    

def scrape_amazon(query):
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('user-agent=Mozilla/5.0')

    driver = webdriver.Chrome(options=options)
    base_url = "https://www.amazon.com"

    try:
        url = f"{base_url}/s?k={query.replace(' ', '+')}"
        driver.get(url)
        time.sleep(5)  # Allow page to load fully

        soup = BeautifulSoup(driver.page_source, 'html.parser')
        product_cards = soup.select('div.s-main-slot div[data-component-type="s-search-result"]')

        print(product_cards)

        products = []
        for card in product_cards:
            try:
                # Get product title and URL
                title_anchor = card.select_one('h2 a')
                title_tag = title_anchor.select_one('span') if title_anchor else None
                url_suffix = title_anchor.get('href') if title_anchor else None

                if not title_tag or not url_suffix:
                    continue

                name = title_tag.text.strip()
                url = base_url + url_suffix

                # Get price
                price_whole = card.select_one('span.a-price > span.a-price-whole')
                price_frac = card.select_one('span.a-price > span.a-price-fraction')
                if price_whole and price_frac:
                    price_str = f"{price_whole.text.strip().replace(',', '')}.{price_frac.text.strip()}"
                    price = int(float(price_str) * 150)  # Convert USD to KES
                else:
                    continue  # Skip if price is missing

                # Get image
                image_tag = card.select_one('img.s-image')
                image = image_tag.get('src') if image_tag else ""

                products.append({
                    "id": str(uuid.uuid4())[:8],
                    "name": name,
                    "price": price,
                    "image": image,
                    "source": "Amazon",
                    "url": url,
                    "rating": round(random.uniform(3.0, 5.0), 1)
                })

            except Exception as e:
                print(f"Error parsing Amazon product: {e}")
                continue

    finally:
        driver.quit()

    return products

def scrape_aliexpress(query):
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('user-agent=Mozilla/5.0')

    driver = webdriver.Chrome(options=options)
    base_url = "https://www.aliexpress.com"

    try:
        search_url = f"{base_url}/wholesale?SearchText={query.replace(' ', '+')}"
        driver.get(search_url)
        time.sleep(5)  # Allow time for the page to load fully

        soup = BeautifulSoup(driver.page_source, 'html.parser')
        product_cards = soup.select('div[data-widget-type="productCard"]')

        products = []
        for card in product_cards:
            try:
                # Extract product name
                title_tag = card.select_one('a[data-widget-type="productTitle"]')
                name = title_tag.get_text(strip=True) if title_tag else None
                url = base_url + title_tag.get('href') if title_tag else None

                # Extract price
                price_tag = card.select_one('div[data-widget-type="price"]')
                price_text = price_tag.get_text(strip=True).replace(',', '') if price_tag else None
                price = int(float(price_text.strip('$')) * 150) if price_text else None  # Convert to KES

                # Extract image
                image_tag = card.select_one('img')
                image = image_tag.get('src') if image_tag else ""

                if name and url and price:
                    products.append({
                        "id": str(uuid.uuid4())[:8],
                        "name": name,
                        "price": price,
                        "image": image,
                        "source": "AliExpress",
                        "url": url,
                        "rating": round(random.uniform(3.0, 5.0), 1)
                    })

            except Exception as e:
                print(f"Error parsing AliExpress product: {e}")
                continue

        return products

    finally:
        driver.quit()

