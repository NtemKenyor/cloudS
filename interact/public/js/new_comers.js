    const uniqueContent = {
    slides: [
      {
        category: "What We Have Built",
        title: "Creatives Arena",
        text: "A vibrant hub where creatives can share content and earn exciting rewards. We champion free speech and innovation, empowering creators worldwide.",
        icon: `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--primary-red)" stroke-width="2" fill="none" />
            <line x1="12" y1="6" x2="12" y2="18" stroke="var(--primary-red)" stroke-width="2" />
            <line x1="6" y1="12" x2="18" y2="12" stroke="var(--primary-red)" stroke-width="2" />
          </svg>
        `,
      },
      {
        category: "What We Have Built",
        title: "Anonymous Messaging",
        text: "Our anonymous messaging platform allows you to send heartfelt or secret messages without revealing your identity. Say what you truly feel.",
        icon: `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="16" rx="4" ry="4" stroke="var(--primary-blue)" stroke-width="2" />
            <path d="M6 10h12M6 14h8" stroke="var(--primary-blue)" stroke-width="2" />
          </svg>
        `,
      },
      {
        category: "What We Have Built",
        title: "Cool Rewarding Games",
        text: "Dive into our world of games! Enjoy fun and rewarding challenges, bridging traditional games with the power of Web3. Let the adventure begin!",
        icon: `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3 7h7l-6 4 3 7-6-4-6 4 3-7-6-4h7z" fill="var(--primary-red)" />
          </svg>
        `,
      },
      {
        category: "What We Have Built",
        title: "Your Funds, Your Power",
        text: "Experience complete control of your funds. Transfer seamlessly to any wallet or exchange of your choice. Your money, your rules.",
        icon: `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <path d="M3 11h18v2H3z" fill="var(--primary-blue)" />
            <circle cx="12" cy="12" r="5" stroke="var(--primary-blue)" stroke-width="2" />
          </svg>
        `,
      },
      {
        category: "The Future",
        title: "Improved Security",
        text: "We are committed to enhancing platform security. Expect advanced encryption, multi-layered protection, and unmatched reliability for your data.",
        icon: `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.1 0 2 .9 2 2H10c0-1.1.9-2 2-2zm0 16c-2.21 0-4-1.79-4-4h8c0 2.21-1.79 4-4 4z" fill="var(--primary-red)" />
          </svg>
        `,
      },
      {
        category: "The Future: Bright Horizons",
        title: "Unmatched Value",
        text: "We're building an ecosystem packed with creative contests, Web3 challenges, innovative features, and thrilling games. Your satisfaction drives us. Thank you for joining us on this exciting journey!",
        icon: `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <path d="M2 12l10-8 10 8-10 8z" fill="var(--primary-blue)" />
            <circle cx="12" cy="12" r="4" fill="var(--primary-red)" />
          </svg>
        `,
      },
    ],
  };
  

   
    function uniqueUpdateSlide() {
        const slide = uniqueContent.slides[uniqueCurrentSlide];
        uniqueCategoryEl.textContent = slide.category;
        uniqueTitleEl.textContent = slide.title;
        uniqueTextEl.textContent = slide.text;
        uniqueIconEl.innerHTML = slide.icon;
    
        // Assign class based on category for styling
        document.querySelector('.unique-slide-show').className = `unique-slide-show category-${slide.category.replace(/\s+/g, '-')}`;
    
        uniquePrevBtn.disabled = uniqueCurrentSlide === 0;
        // uniqueNextBtn.disabled = uniqueCurrentSlide === uniqueContent.slides.length - 1;

        if (uniqueCurrentSlide === uniqueContent.slides.length - 1) {
            
            uniqueNextBtn.textContent = "Start";
        }
    }

    
   /* function uniqueUpdateSlide() {
        const slide = uniqueContent.slides[uniqueCurrentSlide];

        // Add a fade-out class before updating the content
        const slideShow = document.querySelector('.unique-slide-show');
        slideShow.classList.add("unique-fade-out-slide");

        // Wait for the fade-out to complete, then update content
        setTimeout(() => {
            uniqueCategoryEl.textContent = slide.category;
            uniqueTitleEl.textContent = slide.title;
            uniqueTextEl.textContent = slide.text;
            uniqueIconEl.innerHTML = slide.icon;

            // Assign unique class for styling per category
            slideShow.className = `unique-slide-show category-${slide.category.replace(/\s+/g, '-')}`;
            
            // Add a fade-in effect after updating the content
            slideShow.classList.add("unique-fade-in-slide");

            // Ensure buttons are enabled/disabled appropriately
            uniquePrevBtn.disabled = uniqueCurrentSlide === 0;

            if (uniqueCurrentSlide === uniqueContent.slides.length - 1) {
                uniqueNextBtn.textContent = "Finish";
            } else {
                uniqueNextBtn.textContent = "Next";
            }

            // Remove the animation classes after they finish
            setTimeout(() => {
                slideShow.classList.remove("unique-fade-out-slide", "unique-fade-in-slide");
            }, 500); // Match animation duration
        }, 500); // Match fade-out duration
    }
 */
    
 // Handle "Finish" logic when Next is clicked on the last slide
    /* uniqueNextBtn.addEventListener("click", () => {
        if (uniqueCurrentSlide === uniqueContent.slides.length - 1) {
            const slideContainer = document.getElementById("unique-slide-container");
            slideContainer.classList.add("unique-fade-out"); // Add fade-out animation to container

            // After animation ends, remove the container and set the cookie
            setTimeout(() => {
                slideContainer.remove();
                document.cookie = "uniqueViewedSlides=true; path=/";
            }, 1000); // Match container animation duration
        }
    }); */

    function uniqueNextSlide() {
      if (uniqueCurrentSlide < uniqueContent.slides.length - 1) {
        uniqueCurrentSlide++;
        uniqueUpdateSlide();
      }else{
        const slideContainer = document.getElementById("unique-slide-container");
        slideContainer.classList.add("unique-fade-out"); // Add fade-out animation
            
        // After animation ends, remove the element and set the cookie
        setTimeout(() => {
            slideContainer.remove(); // Remove after animation
            document.cookie = "uniqueViewedSlides=true; path=/";
        }, 1000); // Match the animation duration (1s)
      }
    }
  
    function uniquePrevSlide() {
      if (uniqueCurrentSlide > 0) {
        uniqueCurrentSlide--;
        uniqueUpdateSlide();
      }
    }
  
    
    function addMovingCircles() {
      const container = document.querySelector('.unique-slide-container');
  
      // Circle animation settings
      const circleCount = 20; // Number of circles
      const colors = ['#d32f2f', '#1976d2', '#ffffff']; // Core colors
      const minSize = 10; // Minimum size of circles
      const maxSize = 50; // Maximum size of circles
      const animationDuration = 10; // Max animation duration in seconds
  
      // Function to generate random values
      const getRandom = (min, max) => Math.random() * (max - min) + min;
  
      // Create circles and add to container
      for (let i = 0; i < circleCount; i++) {
          const circle = document.createElement('div');
          circle.classList.add('animated-circle');
  
          // Randomize circle properties
          const size = getRandom(minSize, maxSize);
          const color = colors[Math.floor(Math.random() * colors.length)];
          const left = `${getRandom(0, 100)}%`;
          const animationTime = getRandom(5, animationDuration);
  
          // Apply styles
          circle.style.width = `${size}px`;
          circle.style.height = `${size}px`;
          circle.style.backgroundColor = color;
          circle.style.left = left;
          circle.style.animationDuration = `${animationTime}s`;
          circle.style.animationDelay = `${getRandom(0, animationDuration)}s`;
  
          container.appendChild(circle);
      }
  
      // Add CSS for the animation
      const style = document.createElement('style');
      style.innerHTML = `
          .animated-circle {
          position: absolute;
          bottom: -50px; /* Start below the screen */
          border-radius: 50%;
          opacity: 0.8;
          animation: moveUp infinite linear;
          }
  
          @keyframes moveUp {
          0% {
              transform: translateY(0);
              opacity: 0.8;
          }
          50% {
              opacity: 0.5;
          }
          100% {
              transform: translateY(-110vh); /* Move off the top of the screen */
              opacity: 0;
          }
          }
      `;
      document.head.appendChild(style);
      }
  

      let uniqueCurrentSlide = 0;
  
    const uniqueCategoryEl = document.getElementById('unique-slide-category');
    const uniqueTitleEl = document.getElementById('unique-slide-title');
    const uniqueTextEl = document.getElementById('unique-slide-text');
    const uniquePrevBtn = document.getElementById('unique-prev-btn');
    const uniqueNextBtn = document.getElementById('unique-next-btn');
    const uniqueIconEl = document.getElementById('unique-slide-icon');

    uniquePrevBtn.addEventListener('click', uniquePrevSlide);
    uniqueNextBtn.addEventListener('click', uniqueNextSlide);
  
    uniqueUpdateSlide();
  
    // Call the function to add the circles
    addMovingCircles();

      const uniqueViewedSlides = document.cookie.split('; ').find(row => row.startsWith('uniqueViewedSlides='));
  if (uniqueViewedSlides && uniqueViewedSlides.split('=')[1] === 'true') {
    // document.getElementById('unique-slide-show').remove(); // Remove if viewed
    document.getElementById('unique-slide-container').remove(); // Remove if viewed
    
  } else {
    document.getElementById('unique-slide-container').style.display = 'flex';
  }
      
