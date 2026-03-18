const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const navLinks = [...document.querySelectorAll(".nav-link")];
const revealItems = document.querySelectorAll(".reveal");
const sectionTargets = [...document.querySelectorAll("main section[id]")];
const serviceCards = [...document.querySelectorAll("[data-service-card]")];
const serviceTriggers = [...document.querySelectorAll("[data-service-trigger]")];
const serviceSelect = document.getElementById("serviceSelect");
const faqItems = [...document.querySelectorAll("[data-faq-item]")];

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 10);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  revealItems.forEach((item) => revealObserver.observe(item));

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, {
    threshold: 0.45,
    rootMargin: "-20% 0px -35% 0px",
  });

  sectionTargets.forEach((section) => navObserver.observe(section));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const selectService = (serviceName, triggerCard) => {
  serviceCards.forEach((card) => {
    card.classList.toggle("is-selected", card === triggerCard);
  });

  if (serviceSelect) {
    serviceSelect.value = serviceName;
  }

  document.getElementById("kontakt")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

serviceTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const card = trigger.closest("[data-service-card]");
    if (!card) {
      return;
    }

    selectService(card.dataset.service, card);
  });
});

faqItems.forEach((item) => {
  const button = item.querySelector("[data-faq-button]");
  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");

    faqItems.forEach((faqItem) => {
      faqItem.classList.remove("is-open");
      faqItem.querySelector("[data-faq-button]")?.setAttribute("aria-expanded", "false");
    });

    if (!isOpen) {
      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");

if (form && status) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = data.get("name").toString().trim();
    const email = data.get("email").toString().trim();
    const phone = data.get("phone").toString().trim();
    const service = data.get("service").toString().trim();
    const message = data.get("message").toString().trim();

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    status.className = "form-status is-pending";
    status.textContent = "Odesílám poptávku...";

    try {
      const response = await fetch("https://formsubmit.co/ajax/mechurovaklara@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: `Poptávka účetních služeb - ${name}`,
          name,
          email,
          phone: phone || "neuveden",
          service,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Odeslání se nezdařilo");
      }

      status.className = "form-status is-success";
      status.textContent = "Děkujeme, poptávka byla odeslána. Ozveme se vám co nejdříve.";
      form.reset();
      serviceCards.forEach((card) => card.classList.remove("is-selected"));
    } catch (error) {
      status.className = "form-status is-error";
      status.textContent = "Poptávku se nepodařilo odeslat. Napište prosím na mechurovaklara@gmail.com nebo info@ucetnictvikm.cz.";
    } finally {
      submitButton.disabled = false;
    }
  });
}