const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const navOverlay = document.querySelector("[data-nav-overlay]");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const navLinks = [...document.querySelectorAll(".nav-link")];
const revealItems = document.querySelectorAll(".reveal");
const sectionTargets = [...document.querySelectorAll("main section[id]")];
const serviceCards = [...document.querySelectorAll("[data-service-card]")];
const serviceTriggers = [...document.querySelectorAll("[data-service-trigger]")];
const serviceSelect = document.getElementById("serviceSelect");
const selectedServiceNote = document.getElementById("selectedServiceNote");
const faqItems = [...document.querySelectorAll("[data-faq-item]")];
const statNumbers = [...document.querySelectorAll("[data-count]")];
const messageField = document.querySelector('textarea[name="message"]');
const messageCounter = document.getElementById("messageCounter");

const updateSelectedServiceNote = (serviceName) => {
  if (!selectedServiceNote) {
    return;
  }

  if (!serviceName) {
    selectedServiceNote.textContent = "Vyberte oblast, kterou řešíte. Formulář pak bude přesnější a odpověď rychlejší.";
    return;
  }

  selectedServiceNote.textContent = `Vybraná oblast: ${serviceName}. Stačí doplnit stručný popis a kontakt.`;
};

const scrollToSection = (element) => {
  if (!element) {
    return;
  }

  const headerOffset = (header?.offsetHeight || 0) + 16;
  const top = element.getBoundingClientRect().top + window.scrollY - headerOffset;

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: "smooth",
  });
};

const closeMenu = () => {
  if (!nav || !menuToggle) {
    return;
  }

  nav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");

  if (navOverlay) {
    navOverlay.hidden = true;
  }
};

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 10);

  if (!scrollProgress) {
    return;
  }

  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);

    if (navOverlay) {
      navOverlay.hidden = !isOpen;
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") || "";

      closeMenu();

      if (!href.startsWith("#")) {
        return;
      }

      const target = document.querySelector(href);
      if (!target) {
        return;
      }

      event.preventDefault();
      scrollToSection(target);
    });
  });
}

navOverlay?.addEventListener("click", closeMenu);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 880) {
    closeMenu();
  }
});

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

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const element = entry.target;
      const target = Number(element.dataset.count || 0);
      const duration = 1300;
      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(target * eased));

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
      countObserver.unobserve(element);
    });
  }, { threshold: 0.6 });

  statNumbers.forEach((item) => countObserver.observe(item));

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
  statNumbers.forEach((item) => {
    item.textContent = item.dataset.count || item.textContent;
  });
}

const selectService = (serviceName, triggerCard) => {
  serviceCards.forEach((card) => {
    card.classList.toggle("is-selected", card === triggerCard);
  });

  if (serviceSelect) {
    serviceSelect.value = serviceName;
  }

  updateSelectedServiceNote(serviceName);

  scrollToSection(document.getElementById("kontakt"));
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

serviceCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest("button")) {
      return;
    }

    selectService(card.dataset.service, card);
  });
});

serviceSelect?.addEventListener("change", () => {
  updateSelectedServiceNote(serviceSelect.value);
});

updateSelectedServiceNote(serviceSelect?.value || "");

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

if (messageField && messageCounter) {
  const maxLength = 600;
  messageField.maxLength = maxLength;

  const updateCounter = () => {
    messageCounter.textContent = `${messageField.value.length} / ${maxLength}`;
  };

  updateCounter();
  messageField.addEventListener("input", updateCounter);
}

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
      updateSelectedServiceNote("");
      if (messageCounter) {
        messageCounter.textContent = "0 / 600";
      }
      serviceCards.forEach((card) => card.classList.remove("is-selected"));
    } catch (error) {
      status.className = "form-status is-error";
      status.textContent = "Poptávku se nepodařilo odeslat. Napište prosím na mechurovaklara@gmail.com nebo info@ucetnictvikm.cz.";
    } finally {
      submitButton.disabled = false;
    }
  });
}

const tiltItems = [...document.querySelectorAll("[data-tilt]")];
const tiltAllowed = window.matchMedia("(hover: hover) and (pointer: fine)").matches
  && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (tiltAllowed) {
  tiltItems.forEach((item) => {
    const resetTilt = () => {
      item.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(0)";
    };

    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / rect.width;
      const offsetY = (event.clientY - rect.top) / rect.height;
      const rotateY = (offsetX - 0.5) * 8;
      const rotateX = (0.5 - offsetY) * 8;

      item.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    item.addEventListener("pointerleave", resetTilt);
    item.addEventListener("pointercancel", resetTilt);
  });
}