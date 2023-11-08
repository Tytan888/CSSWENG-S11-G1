 document.getElementById("search-button").addEventListener("click", function () {
    const searchTerm = document.getElementById("input-box").value;
    const resultBox = document.querySelector(".result-box");
    // Sample list of search suggestions (you would fetch this from a data source or API in a real scenario)
    const suggestions = [
      "Suggestion 1",
      "Suggestion 2",
      "Suggestion 3",
      "Suggestion 4",
      "Suggestion 5",
    ];

    // Filter suggestions based on the searchTerm (case-insensitive)
    const filteredSuggestions = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Display filtered suggestions in the result box
    if (filteredSuggestions.length > 0) {
      resultBox.innerHTML = `<ul>${filteredSuggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}</ul>`;
    } else {
      resultBox.innerHTML = "No suggestions found.";
    }
  });

