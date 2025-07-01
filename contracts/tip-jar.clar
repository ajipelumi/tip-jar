;; Tip Jar contract
;; This contract allows users to send tips to other users with categories

;; Constants
(define-constant ERR-MINIMUM-TIP-AMOUNT (err u100))
(define-constant ERR-NOT-AUTHORIZED (err u101))
(define-constant ERR-CANNOT-TIP-SELF (err u102))
(define-constant ERR-EMPTY-MESSAGE (err u103))
(define-constant ERR-INVALID-CATEGORY (err u104))
(define-constant ERR-CATEGORY-NAME-TOO-LONG (err u105))

;; Predefined tip categories
(define-constant CATEGORY-CONTENT "content")
(define-constant CATEGORY-SERVICE "service")
(define-constant CATEGORY-DONATION "donation")
(define-constant CATEGORY-EDUCATION "education")
(define-constant CATEGORY-ENTERTAINMENT "entertainment")
(define-constant CATEGORY-HELP "help")
(define-constant CATEGORY-OTHER "other")

;; Data variables
(define-data-var min-tip uint u10)
(define-data-var owner principal tx-sender)

;; Data variable for storing tip history with categories
(define-map tip-history 
  { tx-id: uint }
  { sender: principal, recipient: principal, amount: uint, message: (string-ascii 100), category: (string-ascii 20), timestamp: uint })

;; Variable to keep track of tip count
(define-data-var tip-counter uint u0)

;; Map to store category statistics per recipient
(define-map category-stats
  { recipient: principal, category: (string-ascii 20) }
  { total-amount: uint, tip-count: uint })

;; Function to validate category
(define-private (is-valid-category (category (string-ascii 20)))
  (or
    (is-eq category CATEGORY-CONTENT)
    (is-eq category CATEGORY-SERVICE)
    (is-eq category CATEGORY-DONATION)
    (is-eq category CATEGORY-EDUCATION)
    (is-eq category CATEGORY-ENTERTAINMENT)
    (is-eq category CATEGORY-HELP)
    (is-eq category CATEGORY-OTHER)))


;; Function to update category statistics
(define-private (update-category-stats (recipient principal) (category (string-ascii 20)) (amount uint))
  (let ((current-stats (map-get? category-stats { recipient: recipient, category: category })))
    (match current-stats
      stats (map-set category-stats 
        { recipient: recipient, category: category }
        { total-amount: (+ (get total-amount stats) amount), 
          tip-count: (+ (get tip-count stats) u1) })
      (map-set category-stats 
        { recipient: recipient, category: category }
        { total-amount: amount, tip-count: u1 }))))

;; Function to send a tip to a person with category
(define-public (send-tip (recipient principal) (message (string-ascii 100)) (amount uint) (category (string-ascii 20)))
  (begin
    ;; Validate recipient is not the sender
    (asserts! (not (is-eq recipient tx-sender)) ERR-CANNOT-TIP-SELF)

    ;; Validate message is not empty
    (asserts! (> (len message) u0) ERR-EMPTY-MESSAGE)
    
    ;; Validate category
    (asserts! (is-valid-category category) ERR-INVALID-CATEGORY)
    
    ;; Get the current minimum tip amount and the current tip counter
    (let ((current-min-tip (var-get min-tip))
          (current-counter (var-get tip-counter)))
      ;; Check if the amount is greater than or equal to the minimum tip amount
      (asserts! (>= amount current-min-tip) ERR-MINIMUM-TIP-AMOUNT)
      ;; Transfer the amount from the sender to the recipient
      (try! (stx-transfer? amount tx-sender recipient))
      ;; Store tip history with category
      (map-set tip-history 
        { tx-id: current-counter }
        { sender: tx-sender, 
          recipient: recipient,
          amount: amount, 
          message: message,
          category: category,
          timestamp: burn-block-height })
      ;; Update category statistics
      (update-category-stats recipient category amount)
      ;; Increment the tip counter
      (var-set tip-counter (+ current-counter u1))
      ;; The function returns a success message if the tip is sent successfully
      (ok { recipient: recipient, message: message, amount: amount, category: category }))))

;; Function to get the minimum tip amount
(define-read-only (get-min-tip)
  (var-get min-tip)
)

;; Function to get tip history by transaction ID
(define-read-only (get-tip-by-id (tx-id uint))
  (map-get? tip-history { tx-id: tx-id }))

;; Function to get category statistics for a recipient
(define-read-only (get-category-stats (recipient principal) (category (string-ascii 20)))
  (map-get? category-stats { recipient: recipient, category: category }))

;; Function to get all category statistics for a recipient
(define-read-only (get-all-category-stats (recipient principal))
  (list
    (map-get? category-stats { recipient: recipient, category: CATEGORY-CONTENT })
    (map-get? category-stats { recipient: recipient, category: CATEGORY-SERVICE })
    (map-get? category-stats { recipient: recipient, category: CATEGORY-DONATION })
    (map-get? category-stats { recipient: recipient, category: CATEGORY-EDUCATION })
    (map-get? category-stats { recipient: recipient, category: CATEGORY-ENTERTAINMENT })
    (map-get? category-stats { recipient: recipient, category: CATEGORY-HELP })
    (map-get? category-stats { recipient: recipient, category: CATEGORY-OTHER })))

;; Function to get available categories
(define-read-only (get-available-categories)
  (list CATEGORY-CONTENT CATEGORY-SERVICE CATEGORY-DONATION CATEGORY-EDUCATION CATEGORY-ENTERTAINMENT CATEGORY-HELP CATEGORY-OTHER))

;; Function to update the minimum tip amount (only callable by the owner)
(define-public (set-min-tip (new-min-tip uint))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-NOT-AUTHORIZED)
    (asserts! (> new-min-tip u0) (err u102))
    (var-set min-tip new-min-tip)
    (ok new-min-tip)))
