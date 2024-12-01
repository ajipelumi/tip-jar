;; Error constants
(define-constant ERR-MINIUM-TIP-AMOUNT (err u100))

;; Function to send a tip to a person
(define-public (send-tip (recipient principal) (message (string-ascii 100)) (amount uint))
  (begin
    ;; Check if the amount is greater than or equal to 10
    (asserts! (>= amount u10) ERR-MINIUM-TIP-AMOUNT)
    ;; Transfer the amount from the sender to the recipient
    (try! (stx-transfer? amount tx-sender recipient))
    ;; The function returns a success message if the tip is sent successfully
    (ok { recipient: recipient, message: message, amount: amount })
  ))
