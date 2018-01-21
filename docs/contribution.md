# Contribution

Validationator Source Code

Hey, want to contribute to the validationator? Great! There are three major areas in which you can contribute:
  * Performance improvements
  * API improvements
  * Additional validations and options

If you would like to make an update to one of the three areas above, please first create a GitHub issue describing what it is you are proposing. Label your issue with "Proposed / Discussion" and either "Performance Improvement", "API Improvement", "validation", or "question" (if your comment does not fit into any of the other three categories).

Discussion and approval must happen before a pull request is approved. Once we discuss and decide to pursue an improvement the label will be changed from "Proposed / Discussion" to "Approved". Once the pull request has been merged the ticket will be closed and the label will be set to "Finished"

## Performance Improvements
If you have an idea for how the performance of the validationator can be improved, please first create a GitHub issue describing your proposed improvement for discussion. Please note that many performance optimizations are handled by the babel build pipeline. That said there are many other areas that could probably be improved.

Once a performance upgrade has been greenlighted please just create a pull request with your improvement. Make sure run the testing suite to make sure nothing broke.

## API Improvements
The validationator API should remain fairly stable, but if you have an idea of how it could be better please create a discussion issue. API improvement issues will also entail updating and adding to the tests and documentation. No new features will be implemented unless an accompanying test has been added, all other tests still pass, and documentation has been updated.

## Validation
If you have created a valuable additional validation using validate.extensions, or have extended an existing validation with the extends method option then please consider making a pull request to add it to the library. Please make sure to add a matching unit test and documentation entry in all validation pull requests.
