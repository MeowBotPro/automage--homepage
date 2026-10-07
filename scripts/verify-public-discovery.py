"""Focused browser regression for public discovery. Contact responses are isolated mocks."""
import json
import subprocess
from pathlib import Path

from PIL import Image

SESSION = "automage-discovery-regression"
ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / ".workflow/.scratchpad/market-redesign-20260914"
EVIDENCE.mkdir(parents=True, exist_ok=True)
checks = []


def browser(*args):
    result = subprocess.run(["agent-browser", "--session", SESSION, *args], text=True, capture_output=True, timeout=35)
    if result.returncode:
        raise RuntimeError(f"Browser command {args[0]} failed: {result.stdout} {result.stderr}")
    if args[0] == "open":
        browser("wait", "--load", "networkidle")
    return result.stdout.strip()


def evaluate(code):
    return json.loads(browser("eval", "({value:(" + code + ")})"))["value"]


def wait(condition):
    browser("wait", "--fn", condition)


def visible(selector):
    browser("scrollintoview", selector)
    code = f"(() => {{ const r=document.querySelector({json.dumps(selector)}).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }})()"
    wait(code)


def click(selector):
    browser("snapshot", "-i")
    visible(selector)
    browser("wait", "--load", "networkidle")
    browser("click", selector)


def fill(selector, value):
    visible(selector)
    browser("fill", selector, value)


def screenshot(name, height=1000):
    raw = EVIDENCE / f"{name}-raw.png"
    target = EVIDENCE / f"{name}.png"
    browser("screenshot", "body", str(raw))
    with Image.open(raw) as image:
        image.crop((0, 0, image.width, min(height, image.height))).save(target)


def passed(name):
    checks.append(name)
    print("PASS", name, flush=True)


try:
    browser("open", "http://127.0.0.1:3000/")
    browser("set", "viewport", "1440", "1000")
    click('button[role="tab"]:first-child')
    wait('document.body.innerText.includes("信息来了，还需要补齐上下文")')
    click('button[role="tab"]:nth-child(3)')
    wait('document.body.innerText.includes("需要判断时，找到有职责的人")')
    click('button[role="tab"]:nth-child(2)')
    screenshot("home-desktop")
    passed("homepage work states respond to real clicks")

    click('nav[aria-label="主导航"] a[href="/market"]')
    wait('location.pathname === "/market"')
    screenshot("market-desktop")
    fill('input[aria-label="搜索工作或 Skill"]', "采购比价")
    browser("press", "Enter")
    wait('new URLSearchParams(location.search).get("q") === "采购比价"')
    assert evaluate('document.querySelectorAll("article[id^=task-]").length') == 1
    click('summary[role="button"]')
    wait('document.querySelector("details").open')
    assert "两套 1688 指导材料有较多重叠" in evaluate('document.body.innerText')
    passed("business search and same-task comparison expose the real differences")

    click('a[href^="/market/1688-product-find?"]')
    wait('location.pathname === "/market/1688-product-find"')
    assert "不包含下单、付款" in evaluate('document.body.innerText')
    screenshot("sourcing-detail")
    click('form[action="/market/intent"] button')
    wait('document.body.innerText.includes("已加入 · 移除")')
    wait('document.querySelector("header a[href=\\\"/contact\\\"]").innerText.includes("1")')
    passed("detail action saves selection and updates navigation")

    click('nav[aria-label="当前位置"] a:first-child')
    wait('location.pathname === "/market" && new URLSearchParams(location.search).get("q") === "采购比价"')
    click('nav[aria-label="工作领域"] a:first-child')
    wait('!new URLSearchParams(location.search).has("q")')
    click('nav[aria-label="任务分页"] a:last-child')
    wait('new URLSearchParams(location.search).get("page") === "2"')
    assert evaluate('document.querySelectorAll("article[id^=task-]").length') == 6
    assert evaluate('new URLSearchParams(location.search).get("view")') == "all"
    click('article[id^="task-"] a')
    wait('location.pathname.startsWith("/market/")')
    click('nav[aria-label="当前位置"] a:first-child')
    wait('new URLSearchParams(location.search).get("page") === "2"')
    passed("all-task pagination and detail return preserve browsing context")

    # The former mutation URL must remain read-only, including when prefetched.
    browser("open", "http://127.0.0.1:3000/market/intent?id=1688-product-find")
    wait('location.pathname === "/market"')
    click('header a[href="/contact"]')
    wait('location.pathname === "/contact"')
    assert "1688 找货比价" in evaluate('document.body.innerText')
    assert evaluate('document.querySelectorAll("input[type=checkbox]:checked").length') == 1
    passed("saved selection reaches contact and GET navigation cannot change it")

    fill('input[name="role"]', "验证用采购负责人")
    fill('textarea[name="need"]', "仅用于隔离回归：比较商品与采购指导的区别。")
    fill('input[name="contact"]', "qa@example.invalid")
    browser("network", "route", "**/api/v1/beta-applications", "--body", json.dumps({"msg": "隔离测试：服务暂时不可用", "data": None}, ensure_ascii=False))
    click('form[action="/api/v1/beta-applications"] button[type="submit"]')
    wait('document.querySelector("[role=alert]") !== null')
    assert evaluate('document.querySelector("textarea").value').startswith("仅用于隔离回归")
    passed("contact failure is visible and preserves the request")

    browser("close")
    browser("open", "http://127.0.0.1:3000/contact")
    wait('location.pathname === "/contact"')
    fill('input[name="role"]', "验证用采购负责人")
    fill('textarea[name="need"]', "仅用于隔离回归成功响应。")
    fill('input[name="contact"]', "qa@example.invalid")
    # The live database is unavailable in this environment. Isolate only this browser request
    # so React can be checked against a deterministic success response without writing data.
    browser("eval", "(() => { const realFetch = window.fetch; window.fetch = (input, init) => String(input).includes('/api/v1/beta-applications') ? Promise.resolve(new Response(JSON.stringify({data:{record:{application_public_id:'ISOLATED-UI-TEST'}}}), {status:200, headers:{'Content-Type':'application/json'}})) : realFetch(input, init); })()")
    click('form[action="/api/v1/beta-applications"] button[type="submit"]')
    wait('document.body.innerText.includes("需求已收到")')
    assert "本次咨询附上了 0 项能力" in evaluate('document.body.innerText')
    passed("isolated contact success shows a receipt without touching a real backend")

    browser("set", "viewport", "390", "844")
    browser("open", "http://127.0.0.1:3000/market")
    assert evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert evaluate('document.querySelector("input[aria-label=\\\"搜索工作或 Skill\\\"]").getBoundingClientRect().bottom < innerHeight')
    screenshot("market-mobile", 844)
    browser("open", "http://127.0.0.1:3000/")
    assert evaluate('document.documentElement.scrollWidth <= innerWidth')
    screenshot("home-mobile", 844)
    passed("mobile homepage and Market fit the screen and expose search")
    errors = browser("errors")
    if errors:
        raise AssertionError("Browser errors: " + errors)
    (EVIDENCE / "browser-checks.json").write_text(json.dumps({"checks": checks, "contact": "isolated mocked responses; no real consultation submitted", "viewport": ["1440x1000", "390x844"]}, ensure_ascii=False, indent=2))
finally:
    browser("close")
