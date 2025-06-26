 const sidebar = document.getElementById('sidebar');
        const content = document.getElementById('content');
        const hamburger = document.getElementById('hamburger');
        const logout = document.getElementById("logout");

        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            content.classList.toggle('shift');
            hamburger.classList.toggle('open');
        });

        document.getElementById("home").addEventListener("click", () => window.location.href = "/patient/dashboard/<%= patient._id %>");
        document.getElementById("lessons").addEventListener("click", () => window.location.href = "/lessons");
        document.getElementById("games").addEventListener("click", () => window.location.href = "/games");
        document.getElementById("quiz").addEventListener("click", () => window.location.href = "/quizform");
        document.getElementById("reports").addEventListener("click", () => window.location.href = "/report");
        document.getElementById("therapist-appointment").addEventListener("click", () => window.location.href = "/readaddtherapist");
        document.getElementById("exercise-list").addEventListener("click", () => window.location.href = "/exercises");

        logout.addEventListener("click", () => window.location.href = "/login");
 
        